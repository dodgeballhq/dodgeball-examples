

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string welcomeText = @"
Welcome to the Dodgeball Server Example for .NET. 
";

app.MapGet("/", () => welcomeText);

app.Run();
