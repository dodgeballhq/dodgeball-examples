using Dodgeball.TrustServer.Api;
using Microsoft.AspNetCore.Mvc;

using Dodgeball.TrustServer.Api;

namespace Dodgeball.Examples.ProtectedService;

public class SampleTransactionResult
{
    /*
     * If we had a database backing this example,
     * this would be the key of some Primary
     * Key on an approved transaction, or perhaps
     * a summary of the transaction
     */
    public string SampleConfirmationCode { get; set; }
    
    /*
     * Marker to indicate whether the client must re-submit
     * after handling Front End operations such as MFA
     */
    public bool   RequiresResubmit { get; set; }
    
    /*
     * Dodgeball Verification Object, representing the
     * Back End summary of operations.  Most relevant
     */
    public DodgeballVerification Verification { get; set; }
}

[Produces("application/json")]
public class ClientTransactionController : Controller
{
    [HttpPost]
    public async Task<IActionResult> postTransaction()
    { 
      var privateKey = this.Vars["PRIVATE_API_KEY"];
      var dodgeball = new Dodgeball(
        privateKey);
      
      var dbResponse = await dodgeball.Checkpoint(
        new DodgeballEvent(
          "WITH_MFA",
          "128.103.69.86",
          checkpointData),
        null,
        dateString,
        "test@dodgeballhq.com"
      );

      Assert.IsTrue(dbResponse.success);

      if (dodgeball.IsAllowed(dbResponse))
      {
        // This is the scenario under which we have completed 
        // But we should be in blocked state with MFA
        Assert.Fail("We should be blocked");
      } else if (dodgeball.IsDenied(dbResponse)) {
        Console.WriteLine("Pass a forbidden response to client");
      } else if (dodgeball.IsRunning(dbResponse)) {
        Console.WriteLine("Pass control back to the JS Client to render MFA");
      }
      else
      {
        Assert.Fail("This is an error state!");
      } 
      
        return Ok();
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
          mfaPhoneNumbers = this.Vars["MFA_PHONE_NUMBERS"],
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
      
      return checkpointData
    }
    
}