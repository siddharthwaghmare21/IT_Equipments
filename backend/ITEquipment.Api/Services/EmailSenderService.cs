using System.Net;
using System.Net.Mail;
using ITEquipment.Api.Models;
using Microsoft.Extensions.Options;

namespace ITEquipment.Api.Services;

public sealed record EmailSendResult(bool Sent, string Message);

public sealed class EmailSenderService(IOptions<EmailOptions> options, ILogger<EmailSenderService> logger)
{
    private readonly EmailOptions emailOptions = options.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(emailOptions.SmtpHost) &&
        !string.IsNullOrWhiteSpace(emailOptions.FromEmail);

    public async Task<EmailSendResult> SendOtpAsync(
        string toEmail,
        string purpose,
        string otpCode,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken)
    {
        if (!IsConfigured)
        {
            return new EmailSendResult(false, "SMTP email settings are not configured.");
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(emailOptions.FromEmail, emailOptions.FromName),
                Subject = $"IT Equipment OTP - {purpose}",
                Body = BuildOtpEmailBody(purpose, otpCode, expiresAt),
                IsBodyHtml = false
            };
            message.To.Add(toEmail);

            using var smtpClient = new SmtpClient(emailOptions.SmtpHost, emailOptions.SmtpPort)
            {
                EnableSsl = emailOptions.EnableSsl
            };

            if (!string.IsNullOrWhiteSpace(emailOptions.Username))
            {
                smtpClient.Credentials = new NetworkCredential(
                    emailOptions.Username,
                    emailOptions.Password);
            }

            await smtpClient.SendMailAsync(message, cancellationToken);
            return new EmailSendResult(true, "OTP email sent successfully.");
        }
        catch (Exception exception) when (exception is SmtpException or InvalidOperationException)
        {
            logger.LogWarning(exception, "OTP email send failed for {Email}.", toEmail);
            return new EmailSendResult(false, "OTP email could not be sent.");
        }
    }

    private static string BuildOtpEmailBody(string purpose, string otpCode, DateTimeOffset expiresAt)
    {
        return $"""
            Hello,

            Your OTP for {purpose} is: {otpCode}

            This OTP expires at {expiresAt:dd-MMM-yyyy hh:mm tt}.
            Do not share this code with anyone.

            IT Equipment Management
            """;
    }
}
