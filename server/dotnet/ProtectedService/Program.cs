using Dodgeball.Examples.ProtectedService;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers(options =>
{
    options.RespectBrowserAcceptHeader = true;
}).AddNewtonsoftJson();;
builder.Services.AddMvc();
var app = builder.Build();

string welcomeText = @"
Welcome to the Dodgeball Server Example for .NET. 
";


app.MapGet("/", () => welcomeText);
app.MapDefaultControllerRoute();

app.Run();
