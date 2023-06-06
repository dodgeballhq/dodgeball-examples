using System.Net;
using System.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Newtonsoft.Json;
using DodgeballApi = Dodgeball.TrustServer.Api;

namespace Dodgeball.Examples.ProtectedService.Controllers;

public class ServiceRequest
{
  public string checkpointName { get; set; }
  public object payload { get; set; }
  public string? sourceToken { get; set; }
  public string? sessionId { get; set; }
  public string? userId { get; set; }
  public string? verificationId { get; set; }
}


[Produces("application/json")]
public class CheckpointController : Controller
{
  [HttpPost]
  public async Task<IActionResult> Index(
      //string bodyString
      [FromBody] ServiceRequest serviceRequest)
    {
      try
      {
        // ServiceRequest serviceRequest = JsonConvert.DeserializeObject<ServiceRequest>(bodyString);

        var privateKey = SimpleEnv.GetEnv("DODGEBALL_PRIVATE_API_KEY");
        var dodgeball = new DodgeballApi.Dodgeball(
          privateKey,
          new DodgeballApi.DodgeballConfig
          {
            ApiUrl = SimpleEnv.GetEnv("DODGEBALL_API_URL")
          });
        
        // register a page event
        var dbEvent = await dodgeball.PostEvent(
          serviceRequest.sourceToken,
          serviceRequest.sessionId,
          serviceRequest.userId,
          new DodgeballApi.DodgeballEvent(
            "PROTECTED_SERVICE_PRE_CHECKPOINT",
            "76.90.54.224",
            new
            {
              sourceValue = "Arbitrary Data"
            })
        );

        Console.WriteLine("Dodgeball Event", dbEvent);
        
        var dbResponse = await dodgeball.Checkpoint(
          new DodgeballApi.DodgeballEvent(
            serviceRequest.checkpointName,

            /*
             * In this case we're not receiving an IP Address from the
             * client, so take an arbitrary one.
             */
            "76.90.54.224",
            serviceRequest.payload),
          serviceRequest.sourceToken,
          serviceRequest.sessionId,
          serviceRequest.userId,
          serviceRequest.verificationId
        );

        
        if (dbResponse.verification != null && 
            dbResponse.verification.stepData != null && 
            dbResponse.verification.stepData.customMessage != null)
        {
          Console.WriteLine("Step Data: " + dbResponse.verification.stepData.customMessage);
        }
        
        if (dodgeball.IsAllowed(dbResponse))
        {
          var result = new SampleTransactionResult(dbResponse.verification);
          return this.Ok(result);
        }
        else if (dodgeball.IsRunning(dbResponse))
        {
          Console.WriteLine("Pass control back to the JS Client to render MFA");

          return StatusCode((int)HttpStatusCode.Accepted,
            new SampleTransactionResult(
            dbResponse.verification,
            true,
            null));
        }
        else if (dodgeball.IsDenied(dbResponse))
        {
          Console.WriteLine("Pass a forbidden response to client");

          if (dbResponse.verification.stepData != null && dbResponse.verification.stepData.customMessage != null)
          {
            Console.WriteLine("Step Data: " + dbResponse.verification.stepData.customMessage);
          }

          return StatusCode((int)HttpStatusCode.Forbidden,
            new SampleTransactionResult(
                    dbResponse.verification,
            false,
            null));
        }
        else
        {
          Console.WriteLine("An error occurred");
          return StatusCode((int)HttpStatusCode.InternalServerError,
            new SampleTransactionResult(
              dbResponse.verification,
              false,
              null)
          );
        }
      }
      catch (Exception exc)
      {
        Console.WriteLine("Error: ${0}", exc);

        var response = new HttpResponseMessage(HttpStatusCode.UnprocessableEntity);
        response.Content = new StringContent(exc.ToString());
        return this.BadRequest(exc);
      }
    }
}