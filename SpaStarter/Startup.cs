using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using Microsoft.AspNetCore.Rewrite;


namespace SpaStarter
{
    using Formatters;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.StaticFiles;
    using Microsoft.Extensions.Primitives;
    using System.IO;

    //using Services;
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            var builder = new ConfigurationBuilder().SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.secrets.json", optional: true)
                .AddEnvironmentVariables();
            if (env.IsDevelopment())
            {
                //builder.AddUserSecrets<Startup>(); //if we want to use local secrets instead of a secrets.json file
            }
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.AddControllers();
            services.AddCors();
            services.AddHsts(options =>
            {
                options.MaxAge = TimeSpan.FromDays(90);
                options.IncludeSubDomains = true;
                options.Preload = true;
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "SpaStarter", Version = "v1" });
            });

            services.AddMvc(options =>
            {
                options.InputFormatters.Add(new XmlSerializerInputFormatter(options));
                options.OutputFormatters.Add(new XmlSerializerOutputFormatter());
                options.InputFormatters.Add(new RawRequestBodyInputFormatter());
            }
                );

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });
            services.AddResponseCompression(options =>
            {
                options.MimeTypes = new[]
                {
            // Default
            "text/plain",
            "text/css",
            "application/javascript",
            "text/html",
            "text/javascript",
            "application/xml",
            "text/xml",
            "application/json",
            "text/json",
            // Custom
            "image/svg+xml"
                };
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var provider = new FileExtensionContentTypeProvider();
            // Add new mappings
            provider.Mappings[".jsonp"] = "application/javascript";

            app.UseStaticFiles(
                new StaticFileOptions
                {

                    ContentTypeProvider = provider,
                    ServeUnknownFileTypes = true,
                    DefaultContentType = "text/plain"
                });

            if (env.IsDevelopment())
            {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SpaStarter v1"));
            }
            app.UseCors(builder => {
                builder
           .AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
            });
            if (env.IsProduction())
            {
                app.UseHsts();
                app.UseResponseCompression();
                app.UseHttpsRedirection();
            }

            using StreamReader iisUrlRewriteStreamReader = File.OpenText("IISUrlRewrite.xml");
            var options = new RewriteOptions().AddIISUrlRewrite(iisUrlRewriteStreamReader);
            app.UseRewriter(options);
            app.UseMiddleware<SecurityHeadersMiddleware>();

            // app.UseAuthorization();
            app.UseDefaultFiles(new DefaultFilesOptions
            {
                DefaultFileNames = new List<string> { "index.html" }
            });

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                      name: "default",
                      pattern: "{controller}/{action=Index}/{id?}");
            });

            app.MapWhen(x => !x.Request.Path.Value.StartsWith("/api"), builder =>
            {
                builder.UseSpa(spa =>
                {
                    if (env.IsDevelopment())
                    {
                        // Ensure that you start webpack-dev-server - run "build:hotdev" npm script
                        // Also if you install the npm task runner extension then the webpack-dev-server script will run when the solution loads
                        // spa.UseProxyToSpaDevelopmentServer("http://localhost:8085"); //only needed if you are doing MVC with razor pages.
                    }
                });
            });
        }
    }

    public sealed class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
            // TODO Change the value depending of your needs
            context.Response.Headers.Add("referrer-policy", new StringValues("strict-origin-when-cross-origin"));

            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
            context.Response.Headers.Add("x-content-type-options", new StringValues("nosniff"));

            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
            context.Response.Headers.Add("x-frame-options", new StringValues("DENY"));

            // https://security.stackexchange.com/questions/166024/does-the-x-permitted-cross-domain-policies-header-have-any-benefit-for-my-websit
            context.Response.Headers.Add("X-Permitted-Cross-Domain-Policies", new StringValues("none"));

            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
            context.Response.Headers.Add("x-xss-protection", new StringValues("1; mode=block"));

            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT
            // You can use https://report-uri.com/ to get notified when a misissued certificate is detected
            context.Response.Headers.Add("Expect-CT", new StringValues("max-age=0, enforce, report-uri=\"https://example.report-uri.com/r/d/ct/enforce\""));
            
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
            // https://github.com/w3c/webappsec-feature-policy/blob/master/features.md
            // https://developers.google.com/web/updates/2018/06/feature-policy
            // TODO change the value of each rule and check the documentation to see if new features are available
            context.Response.Headers.Add("Feature-Policy", new StringValues(
                "accelerometer 'none';" +
                //"ambient-light-sensor 'none';" +
                "autoplay 'none';" +
                //"battery 'none';" +
                "camera 'none';" +
                //"display-capture 'none';" +
                "document-domain 'none';" +
                "encrypted-media 'none';" +
                //"execution-while-not-rendered 'none';" +
                //"execution-while-out-of-viewport 'none';" +
                "gyroscope 'none';" +
                "magnetometer 'none';" +
                "microphone 'none';" +
                "midi 'none';" +
                //"navigation-override 'none';" +
                "payment 'none';" +
                "picture-in-picture 'none';" +
                "publickey-credentials-get 'none';" +
                "sync-xhr 'none';" +
                "usb 'none';" +
                //"wake-lock 'none';" +
                "xr-spatial-tracking 'none';"
                ));

            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
            // TODO change the value of each rule and check the documentation to see if new rules are available
            context.Response.Headers.Add("Content-Security-Policy", new StringValues(
                "base-uri 'self';" +
                "block-all-mixed-content;" +
                "child-src 'none';" +
                "connect-src 'self' localhost:8085;" +
                "default-src 'self';" +
                "font-src 'self' localhost:8085 unpkg.com;" +
                "form-action 'none';" +
                "frame-ancestors 'none';" +
                "frame-src 'none';" +
                "img-src 'self' localhost:8085 data:;" +
                "manifest-src 'self';" +
                "media-src 'self';" +
                "object-src 'none';" +
                //"sandbox;" +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' unpkg.com;" +
                "script-src-attr 'self' unpkg.com;" +
                "script-src-elem 'self' 'unsafe-inline' localhost:8085 unpkg.com;" +
                "style-src 'self' unpkg.com;" +
                "style-src-attr 'self' 'unsafe-inline' unpkg.com;" +
                "style-src-elem 'self' 'unsafe-inline' unpkg.com;" +
                "upgrade-insecure-requests;" +
                "worker-src 'none';"
                ));

            return _next(context);
        }
    }
}
