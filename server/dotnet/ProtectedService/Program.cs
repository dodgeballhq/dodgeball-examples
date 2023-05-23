var builder = WebApplication.CreateBuilder(args);
const string myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors();
// Add services to the container.
builder.Services.AddControllers(options =>
{
    options.RespectBrowserAcceptHeader = true;
}).AddNewtonsoftJson(); ;
builder.Services.AddMvc();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(origin => true) // allow any origin
    .AllowCredentials());

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
string welcomeText = @"
Welcome to the Dodgeball Server Example for .NET.
";

app.MapGet("/", () => welcomeText);
app.MapDefaultControllerRoute();

app.Run();
