using DodgeballApi = Dodgeball.TrustServer.Api;

namespace Dodgeball.Examples.ProtectedService;


public class SampleTransactionResult
{
    public SampleTransactionResult()
    {
    }

    public SampleTransactionResult(
        DodgeballApi.DodgeballVerification? verification,
        bool requiresResubmit = false,
        string? sampleConfirmationCode = "12345")
    {
        this.Verification = verification;
        this.RequiresResubmit = requiresResubmit;
        this.SampleConfirmationCode = sampleConfirmationCode;
    }
  
    /*
     * If we had a database backing this example,
     * this would be the key of some Primary
     * Key on an approved transaction, or perhaps
     * a summary of the transaction
     */
    public string? SampleConfirmationCode;
    
    /*
     * Marker to indicate whether the client must re-submit
     * after handling Front End operations such as MFA
     */
    public bool RequiresResubmit;
    
    /*
     * Dodgeball Verification Object, representing the
     * Back End summary of operations.  Most relevant
     */
    public DodgeballApi.DodgeballVerification? Verification = null;
}