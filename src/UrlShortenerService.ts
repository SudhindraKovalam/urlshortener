import * as redis from 'redis'
import * as azureStorage from 'azure-storage';
import * as Promise from 'bluebird';
import * as dateFormat from 'dateformat';

// doesnot have a typed definition, so import node.js style.
var hash =require('uniki');
var URL = require('url-parse');


export class UrlShortenerService {
    
    redisClient: redis.RedisClient
    tableServiceClient : azureStorage.TableService
    tableUtilities : any

    /**
      * Initialize the UrlShortenerService
    */
    constructor() {
        var portNo = 6380;
        var cacheServername =  process.env.REDISCACHE_SERVER_DNS_NAME;
        var cacheServiceAccessKey = process.env.REDISCACHE_KEY;
        var cacheServiceConnectionOptions= {
            auth_pass: cacheServiceAccessKey , 
            tls: {
                servername: cacheServername
            }
        };
        this.redisClient = redis.createClient(portNo, cacheServername, cacheServiceConnectionOptions);
       
        var retryOptions = new azureStorage.ExponentialRetryPolicyFilter(10, 3, 2, 5);
        this.tableServiceClient = new azureStorage.TableService().withFilter(retryOptions);
        this.tableUtilities = azureStorage.TableUtilities;
        this.tableServiceClient.createTableIfNotExists(process.env.REQUEST_LOG_TABLE_NAME, function(error){ 
            if(!error){ 
                // Table exists or created
            }}
        );

    }
    
     /*
     * @Function compressUrl(inputUrl: string, requestIpAddr: string)
     *
     * @Synopsis  Compress the provided URI and return the compressed URI
     * @Description  
            Returns the shortened URI if the URL is not the host URL 
     * @Arguments 
     *   value  The input potential URI to compress.
     *
     * @Returns a promise <string> which is the compresed URI
     */
    public compressUrl(inputUrl: string, requestIpAddr: string) : Promise<string> {
       var that = this;
       return new Promise<string>(function(resolve, reject)
       {
           if(inputUrl.lastIndexOf(process.env.SERVICE_DNS_NAME,0)===0)
           {
               console.info('input url is same as the current site, hence no need to compress');
               reject(new Error("No point in shortening the current site's URLs"));
           }
   
           var shortIdPromise = that.generateShortId(inputUrl);
           shortIdPromise.then((identifier)=>{
               // Log the request for compression and return the shortened URL
               var urlToBeReturned =  process.env.SERVICE_DNS_NAME +'/'+ identifier;
               resolve(urlToBeReturned);
               that.logRequest(inputUrl, identifier, requestIpAddr, 'compress',true);
           })
           .catch((err)=>{
               // Log Error here
               console.error(err.message);
               that.logRequest(inputUrl, 'error', requestIpAddr, 'compress',false);
               reject(err);
           });
       });
    }

    /*
     * @Function expandUrl(inputUrl: string, requestIpAddr: string)
     *
     * @Synopsis  Compress the provided URI and return the compressed URI
     * @Description  
            Returns the expanded URI using the hashid query param from the URI.
     * @Arguments 
     *   value  The input potential URI to expand.
     *
     * @Returns a promise <string> which is the expanded URI
     */
    public expandUrl(shortUrl: string, requestIpAddr: string) :  Promise<string>{
       var that = this;
       return new Promise<string>(function(resolve, reject)
       {
           var shortIdUrlParts= new URL(shortUrl, true);
           
           var shortenedId = shortIdUrlParts.pathname;

           if(shortenedId.charAt(0) === '/'){
             shortenedId= shortenedId.substr(1);
           }
           var expandedUrlPromise = that.getURlFromShortId(shortenedId);
           expandedUrlPromise.then((targeturl)=>{
               resolve(targeturl);
               that.logRequest(shortUrl, targeturl, requestIpAddr, 'expand', true);
           })
           .catch((err)=>{
               // Log Error here
               console.error(err.message);
               that.logRequest(shortUrl, err.message, requestIpAddr, 'error',false);
               reject(err);
           });
       });
    }

    /*
     * @Function generateShortId(inputUrl: string)
     *
     * @Description  Generate the hash for the URI and store it in redis cache and return the shortened URL
     * @Arguments 
     *   inputUrl  The input potential URI to hashed and stored.
     *
     * @Returns a promise <string> which is the shortened URI
     */
    public generateShortId(inputUrl:string): Promise<string>{
       var that = this;
       return new Promise<string>(function(resolve, reject)
       {
           var shortUrlId = hash(inputUrl);
           that.redisClient.get(shortUrlId.toString(), function(err,reply){
              if(!reply){
                   that.redisClient.set(shortUrlId, inputUrl, function(err,reply)
                   {
                       if(!err)
                       {
                           resolve(shortUrlId);
                       }
                       else
                       {
                           console.error(err.message);
                           reject(err);
                       }
                   })
               }
               else{
                   resolve(shortUrlId);
               }

           });
           

       });

    }

     /*
     * @Function getURlFromShortId(inputShortId: string)
     *
     * @Description  Get the URI stored against the provided hash key in redis
     * @Arguments 
     *   inputShortId  The input shortened URI hash.
     *
     * @Returns a promise <string> which is the expanded URI
     */
    public getURlFromShortId(inputShortId: String) : Promise<string>{
       var that = this;
       return new Promise<string>(function(resolve, reject)
       {
           that.redisClient.get(inputShortId, function(err,reply)
           {
               if(!err)
               {
                   if(reply == null)
                   {
                       reject(new Error("URL Not found"));
                   }

                   resolve(reply);
               }
               else
               {
                   console.error(err.message);
                   reject(err);
               }
           })

       });
    }

    /*
     * @Function logRequest(inputURL:string, outputUrl: string, requestorIpAddress, requestType: string, isSuccesful:boolean)
     *
     * @Description  Logs the request
     * @Arguments 
     *   inputURL              The input.
     *   outputUrl             The output.
     *   requestorIpAddress    The requust IP address
     *   requestType           The Type of request
     *   isSuccesful           Logs the request as a success or failure.
     */
    private logRequest(inputURL:string, outputUrl: string, requestorIpAddress, requestType: string, isSuccesful:boolean): void{
        var now =  new Date();
        var partitionKey =  dateFormat(now, "ddmmyyyy").toString();
        var entityGenerator = this.tableUtilities.entityGenerator;
        var logEntry = {
          PartitionKey: entityGenerator.String(partitionKey),
          RowKey: entityGenerator.String(now.getTime().toString()),
          requestIpAddr: entityGenerator.String(requestorIpAddress),
          inputUrl: entityGenerator.String(inputURL),
          outputUrl: entityGenerator.String(outputUrl),
          requestType :entityGenerator.String(requestType),
          isSuccess: entityGenerator.Boolean(isSuccesful)
        };

        this.tableServiceClient.insertEntity(process.env.REQUEST_LOG_TABLE_NAME,logEntry,((error, result, response)=> {
            if(!error){
                // Entity inserted
                return;
              }
              else{
                throw(error);
              }
        }));
    }
}

const urlShortenerService = new UrlShortenerService();

export default urlShortenerService;
