namespace Dodgeball.Examples.ProtectedService;
using dotenv.net;

/*
 * We tend to load example data from .env files, which will not be
 * provided as part of this git repo.  Please see us if you need
 * assistance.
 */
public static class SimpleEnv
{
    private static Dictionary<string, string>? s_lookups = null;

    public static string? GetEnv(string key)
    {
        try
        {
            if (SimpleEnv.s_lookups == null)
            {
                
            }
        }
    }
    
}