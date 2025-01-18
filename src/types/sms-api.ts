export interface SmsApi {
  id: number;
  isActive: boolean;
  method: string;
  providerName: string;
  type: 'sms' | 'whatsapp' | 'email';
  baseUrl: string;
  params: string;
  createdAt: string;
  updatedAt: string;
}
