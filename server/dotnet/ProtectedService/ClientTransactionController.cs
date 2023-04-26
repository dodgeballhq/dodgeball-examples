using System.Net;
using System.Security;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using DodgeballApi = Dodgeball.TrustServer.Api;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Dodgeball.Examples.ProtectedService;

[Produces("application/json")]
public class ClientTransactionController : Controller
{
    [HttpPost]
    public async Task<IActionResult> Transaction()
    {
      try
      {
        var privateKey = SimpleEnv.GetEnv("PRIVATE_API_KEY");
        var dodgeball = new DodgeballApi.Dodgeball(
          privateKey,
          new DodgeballApi.DodgeballConfig
          {
            ApiUrl = SimpleEnv.GetEnv("BASE_URL")
          });

        var checkpointData = this.CreateSampleData();

        var dbResponse = await dodgeball.Checkpoint(
          new DodgeballApi.DodgeballEvent(
            /*
             * Any valid checkpoint name may be used, but we generally
             * instantiate PAYMENT checkpoints on behalf of clients.
             */
            "PAYMENT",

            /*
             * Hard-coded IP, to be converted to a real IP in practice
             */
            "128.103.69.86",
            checkpointData),
          null,
          DateTime.Now.Date.ToShortDateString(),

          /*
           * Hard-coded fake email for simplicity
           */
          "test@dodgeballhq.com"
        );

        if (dodgeball.IsAllowed(dbResponse))
        {
          var result = new SampleTransactionResult(dbResponse.verification);
          return this.Ok(result);
        }
        else if (dodgeball.IsDenied(dbResponse))
        {
          Console.WriteLine("Pass a forbidden response to client");
          return Ok(new SampleTransactionResult(
            dbResponse.verification,
            false,
            null));
        }
        else if (dodgeball.IsRunning(dbResponse))
        {
          Console.WriteLine("Pass control back to the JS Client to render MFA");

          return Ok(new SampleTransactionResult(
            dbResponse.verification,
            true,
            null));

        }
        else
        {
          Console.WriteLine("An error occurred");
          return Ok(new SampleTransactionResult(
            dbResponse.verification,
            false,
            null));
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

    private object CreateSampleData()
    {
      /*
       * The following sample data reflects the layout of information
       * expected by Dodgeball Checkpoints.  
       *
       * Dodgeball generally combines generic information about
       * users wherever possible.  For example, unless specified
       * for a particular integration, customer.primaryEmail will
       * be used whenever the customer's email address is required
       *
       * Where an integration however requires a Provider-Specific
       * ID or value, that should be specified within the provider
       * block, such as gr4vy.transactionId
       */
      var checkpointData = new
        {
          transaction = new
          {
            amount = 10000 / 100,
            currency = "USD",
          },
          paymentMethod = "paymentMethodId",
          customer = new
          {
            primaryEmail = "simpleTest@dodgeballhq.com",
            dateOfBirth = "1990-01-01",
            primaryPhone = "17609003548",
            firstName = "CannedFirst",
          },
          session = new
          {
            userAgent = "unknown user header",
            externalId = "UNK  RAW Session"
          },

          // For now we set a hard-coded list of phone numbers, this can
          // be filled in from the client in order to dynamically set
          // MFA phone numbers
          mfaPhoneNumbers = SimpleEnv.GetEnv("MFA_PHONE_NUMBERS"),
          email = "test@dodgeballhq.com",
          // Gr4vy Testing
          gr4vy = new
          {
            buyerId = "d48f2a52-2cdf-4708-99c5-5bb8717ab11d",
            paymentMethodId = "3ab6199a-c689-4eae-a43c-fa728857f1f1",
            transactionId = "d2ed8384-1f35-4fa2-a950-617e55f9f711",
          },
          merchantRisk = new
          {
            application = new
            {
              id = "ABC123456789XYZ",
              time = "2020-12-31 13:45",
            },
            ipAddress = "65.199.91.101",
            business = new
            {
              name = "Yellowstone Pioneer Lodge",
              address = new
              {
                line1 = "1515 W Park Street",
                city = "Livingston",
                stateCode = "MT",
                postalCode = "59047",
                countryCode = "US",
              },
              phone = new
              {
                number = "406-222-6110",
                countryCode = "US",
              },
              emailAddress = "jdoe@yahoo.com",
            },
            individual = new
            {
              name = "John Doe",
              address = new
              {
                line1 = "1302 W Geyser St",
                city = "Livingston",
                stateCode = "MT",
                postalCode = "59047",
                countryCode = "US",
              },
              phone = new
              {
                number = "2069735100",
                countryCode = "US",
              },
              emailAddress = "jdoe@yahoo.com",
            },
          },

          //Kount Testing
          kount = new
          {
            isAuthorized = "A",
            currency = "USD",
            email = "ashkan@dodgeballhq.com",
            ipAddress = "127.0.0.1",
            paymentToken = "4111111111111111",
            paymentType = "CARD",
            totalAmount = "90000",
            product = new
            {
              description = "FlightBooking",
              itemSKU = "Online Flight Booking",
              price = 633,
              quantity = 2,
              title = "Flight Trip Booking",
            },
            name = "Ashkan Test",
            billingStreet1 = "West St.",
            billingStreet2 = "Apt 222",
            billingCity = "Bellevue",
            billingState = "WA",
            bankIdentificationNumber = "4111",
            ptokCountry = "US",
            billingEmailAge = 6,
          },

          deduce = new
          {
            // email: "billy.glass08@gmail.com",
            isTest = true
          },
          seon = new
          {
            // email: "example@example.com",
            // ip: "1.1.1.1",
            phone = "17609003548",
            fullName = "Example Name",
            firstName = "Example",
            middleName = "string",
            lastName = "string",
            dateOfBirth = "1990-01-01",
            placeOfBirth = "Budapest",
            photoIdNumber = "56789",
            userId = "123456",
            bin = "555555",
          },
          peopleDataLabs = new
          {
            enrichCompany = new
            {
              name = "Google",
              profile = "https://www.linkedin.com/company/google/",
            },
            enrichPerson = new
            {
              firstName = "Elon",
              lastName = "Musk",
              birthDate = " ",
              company = "Tesla",
              primaryEmail = " ",
              phone = " ",
            }
          }
        };

      return checkpointData;
    }
    
}