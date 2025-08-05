import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from || 'noreply@jglgymnastics.org',
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
      replyTo: params.replyTo,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email templates for different scenarios
export const emailTemplates = {
  gymnastWelcome: (gymnast: any, loginUrl: string) => ({
    subject: 'Welcome to the Jewish Gymnastics League!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d946ef;">Welcome to JGL, ${gymnast.firstName}!</h2>
        
        <p>Congratulations! Your gymnastics account has been approved and you're now part of the Jewish Gymnastics League family.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Account Details:</h3>
          <p><strong>Name:</strong> ${gymnast.firstName} ${gymnast.lastName}</p>
          <p><strong>Level:</strong> ${gymnast.level}</p>
          <p><strong>Type:</strong> ${gymnast.type}</p>
          <p><strong>Email:</strong> ${gymnast.email || gymnast.parentEmail}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Your Dashboard
          </a>
        </div>
        
        <p>In your dashboard, you can:</p>
        <ul>
          <li>View and register for upcoming events</li>
          <li>Participate in challenges and earn points</li>
          <li>Track your gymnastics progress</li>
          <li>Connect with coaches and teammates</li>
        </ul>
        
        <p>We're excited to have you in the JGL community!</p>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          The Jewish Gymnastics League Team
        </p>
      </div>
    `,
    text: `Welcome to JGL, ${gymnast.firstName}! Your account has been approved. Login at: ${loginUrl}`
  }),

  registrationApproved: (request: any, loginUrl: string) => ({
    subject: 'JGL Registration Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Great News, ${request.firstName}!</h2>
        
        <p>Your registration request for the Jewish Gymnastics League has been approved!</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3>Registration Details:</h3>
          <p><strong>Name:</strong> ${request.firstName} ${request.lastName}</p>
          <p><strong>Level:</strong> ${request.level}</p>
          <p><strong>Type:</strong> ${request.type}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Your Dashboard
          </a>
        </div>
        
        <p>Welcome to the JGL family! We can't wait to see you at upcoming events.</p>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          The Jewish Gymnastics League Team
        </p>
      </div>
    `,
    text: `Great news ${request.firstName}! Your JGL registration has been approved. Login at: ${loginUrl}`
  }),

  registrationRejected: (request: any, reason?: string) => ({
    subject: 'JGL Registration Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Registration Update</h2>
        
        <p>Dear ${request.firstName},</p>
        
        <p>Thank you for your interest in joining the Jewish Gymnastics League. Unfortunately, we're unable to approve your registration at this time.</p>
        
        ${reason ? `
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        ` : ''}
        
        <p>If you have any questions or would like to discuss this decision, please contact your gym's coaching staff or reach out to us directly.</p>
        
        <p>We appreciate your interest in JGL and encourage you to reapply in the future.</p>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          The Jewish Gymnastics League Team
        </p>
      </div>
    `,
    text: `Hi ${request.firstName}, we're unable to approve your JGL registration at this time. ${reason ? `Reason: ${reason}` : ''} Please contact your gym for more information.`
  }),

  rosterUploadComplete: (upload: any, successCount: number, errorCount: number) => ({
    subject: 'Roster Upload Complete',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d946ef;">Roster Upload Summary</h2>
        
        <p>Your roster upload has been processed successfully.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Upload Details:</h3>
          <p><strong>File:</strong> ${upload.fileName}</p>
          <p><strong>Total Rows:</strong> ${upload.totalRows}</p>
          <p><strong>Successfully Processed:</strong> ${successCount}</p>
          ${errorCount > 0 ? `<p><strong>Errors:</strong> ${errorCount}</p>` : ''}
        </div>
        
        ${successCount > 0 ? `
        <p style="color: #10b981;">✅ ${successCount} gymnast${successCount > 1 ? 's' : ''} successfully added and welcome emails sent!</p>
        ` : ''}
        
        ${errorCount > 0 ? `
        <p style="color: #ef4444;">⚠️ ${errorCount} row${errorCount > 1 ? 's' : ''} could not be processed. Please check the upload details and try again for any failed entries.</p>
        ` : ''}
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          The JGL Team
        </p>
      </div>
    `,
    text: `Roster upload complete. ${successCount} gymnasts added successfully. ${errorCount > 0 ? `${errorCount} errors occurred.` : ''}`
  }),

  coachNotification: (request: any, gymName: string) => ({
    subject: 'New Gymnast Registration Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d946ef;">New Registration Request</h2>
        
        <p>A new gymnast registration request requires your review.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Registration Details:</h3>
          <p><strong>Name:</strong> ${request.firstName} ${request.lastName}</p>
          <p><strong>Level:</strong> ${request.level}</p>
          <p><strong>Type:</strong> ${request.type}</p>
          <p><strong>Birth Date:</strong> ${request.birthDate}</p>
          <p><strong>Gym:</strong> ${gymName}</p>
          ${request.parentEmail ? `<p><strong>Parent Email:</strong> ${request.parentEmail}</p>` : ''}
        </div>
        
        <p>Please log in to your coach dashboard to review and approve or reject this request.</p>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          The JGL System
        </p>
      </div>
    `,
    text: `New registration request from ${request.firstName} ${request.lastName} (Level ${request.level}) at ${gymName}. Please review in your coach dashboard.`
  })
};