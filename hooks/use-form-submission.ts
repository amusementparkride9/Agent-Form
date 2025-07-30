import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { sendLocalNotification, isPushNotificationsEnabled } from '@/lib/push-notification';

interface FormSubmissionData {
  // Agent Information
  agentName: string;
  agentId: string;
  
  // Customer Information
  customerName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  
  // Service Address
  streetAddress: string;
  aptUnit?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Previous Address (if moved)
  movedLastYear: boolean;
  prevStreetAddress?: string;
  prevAptUnit?: string;
  prevCity?: string;
  prevState?: string;
  prevZipCode?: string;
  
  // Service Information
  selectedProvider: string;
  selectedPackage?: string;
  selectedDirectvPackage?: string;
  selectedAddOns: string[];
}

interface SubmissionResult {
  success: boolean;
  message: string;
  submissionId?: string;
}

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const submitForm = async (formData: FormSubmissionData): Promise<SubmissionResult> => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      console.log('Form submission started with data:', formData);
      
      // Try to serialize the data first to catch any issues
      let serializedData;
      try {
        serializedData = JSON.stringify(formData);
        console.log('JSON serialization successful, length:', serializedData.length);
        console.log('Serialized data preview:', serializedData.substring(0, 200));
      } catch (serializationError) {
        console.error('JSON serialization failed:', serializationError);
        throw new Error('Failed to serialize form data');
      }
      
      console.log('Making fetch request to /api/submit-form');
      
      // Submit to your API endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: serializedData,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      // Send client-side push notification immediately after successful submission
      if (isPushNotificationsEnabled()) {
        // Create complete form data for notification
        const notificationData = {
          ...formData,
          submissionDate: new Date().toISOString(),
          ipAddress: 'client'
        };
        sendLocalNotification(notificationData);
      }

      // Send email notification using EmailJS (client-side)
      let emailSent = false;
      try {
        if (
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY &&
          process.env.NEXT_PUBLIC_NOTIFICATION_EMAIL
        ) {
          const emailParams = {
            to_email: process.env.NEXT_PUBLIC_NOTIFICATION_EMAIL,
            subject: `New Internet Order - Agent: ${formData.agentName}`,
            agent_name: formData.agentName,
            agent_id: formData.agentId,
            customer_name: formData.customerName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            service_address: `${formData.streetAddress}${formData.aptUnit ? `, ${formData.aptUnit}` : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            selected_provider: formData.selectedProvider,
            selected_package: formData.selectedPackage,
            directv_package: formData.selectedDirectvPackage || 'None',
            add_ons: formData.selectedAddOns.join(', ') || 'None',
            submission_date: new Date().toLocaleString(),
            moved_last_year: formData.movedLastYear ? 'Yes' : 'No',
            previous_address: formData.movedLastYear && formData.prevStreetAddress 
              ? `${formData.prevStreetAddress}${formData.prevAptUnit ? `, ${formData.prevAptUnit}` : ''}, ${formData.prevCity}, ${formData.prevState} ${formData.prevZipCode}`
              : 'N/A'
          };

          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            emailParams,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
          );
          emailSent = true;
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the entire submission if email fails
      }

      const finalResult: SubmissionResult = {
        success: true,
        message: 'Form submitted successfully!',
        submissionId: result.submissionId,
      };

      setSubmissionResult(finalResult);
      return finalResult;

    } catch (error) {
      const errorResult: SubmissionResult = {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };

      setSubmissionResult(errorResult);
      return errorResult;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSubmission = () => {
    setSubmissionResult(null);
  };

  return {
    submitForm,
    isSubmitting,
    submissionResult,
    resetSubmission,
  };
}
