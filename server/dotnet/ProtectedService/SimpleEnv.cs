namespace Dodgeball.Examples.ProtectedService;
using dotenv.net;

/*
 * We tend to load example data from .env files, which will not be
 * provided as part of this git repo.  Please see us if you need
 * assistance.
 */
public static class SimpleEnv
{
    private static IDictionary<string, string>? s_lookups = null;

    public static string? GetEnv(string key)
    {
        try
        {
            if (SimpleEnv.s_lookups == null)
            {
                var root = Directory.GetCurrentDirectory();
                var dotenv = Path.Combine(root, ".env");
                var dotEnvOptions = new DotEnvOptions();
                DotEnv.Load();
                SimpleEnv.s_lookups = DotEnv.Read();
            }

            return s_lookups[key];
        }
        catch (Exception exc)
        {
            Console.WriteLine(
                "Could not look up key: " + (key ?? "null"));
            
            return null;
        }
    }
    
}