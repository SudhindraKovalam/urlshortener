import * as redis from 'redis'
import * as azureStorage from 'azure-storage';
import * as Promise from 'bluebird';
import * as dateFormat from 'dateformat';

// doesnot have a typed definition, so import node.js style.
var hash =require('uniki');


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
    
    public compressUrl(inputUrl: string, requestIpAddr: string) : Promise<string> {
       var that = this;
       return new Promise<string>(function(resolve, reject)
       {
           if(inputUrl.lastIndexOf(process.env.SERVICE_DNS_NAME,0)===0)
           {
               reject(new Error("Cannot compress current HOST URLs"));
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
               console.log(err);
               that.logRequest(inputUrl, 'error', requestIpAddr, 'compress',false);
               reject(err);
           });
       });
    }

    public expandUrl(shortUrl: string, requestIpAddr: string) :  Promise<string>{
       var that = this;
       return new Promise<string>(function(resolve, reject)
       {
           if(shortUrl.indexOf(process.env.SERVICE_DNS_NAME ) == -1)
           {
               reject(new Error("URL Not found"));
           }

           var shortIdFromUrlParts = shortUrl.split('/');
           var shortenedId = shortIdFromUrlParts[shortIdFromUrlParts.length-1];
           var expandedUrlPromise = that.getURlFromShortId(shortenedId);
           expandedUrlPromise.then((targeturl)=>{
               resolve(targeturl);
               that.logRequest(shortUrl, targeturl, requestIpAddr, 'expand', true);
           })
           .catch((err)=>{
               // Log Error here
               that.logRequest(shortUrl, err.message, requestIpAddr, 'error',false);
               reject(err);
           });
       });
    }    

    public generateShortId(inputUrl:string): Promise<string>{
       var that = this;
       return new Promise<string>(function(resolve, reject)
       {
           var shortUrlId = hash(inputUrl);

           that.redisClient.get(shortUrlId.toString(), function(err,reply){
              if(!reply){
                  that.redisClient.set()
                   that.redisClient.set(shortUrlId, inputUrl, function(err,reply)
                   {
                       if(!err)
                       {
                           resolve(shortUrlId);
                       }
                       else
                       {
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
                   reject(err);
               }
           })

       });
    }

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
