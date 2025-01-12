from aliyunsdkcore.client import AcsClient
from aliyunsdkcore.request import CommonRequest
from flask import current_app
import json

class SMSService:
    def __init__(self):
        self.client = AcsClient(
            current_app.config['ALIYUN_ACCESS_KEY_ID'],
            current_app.config['ALIYUN_ACCESS_KEY_SECRET'],
            'cn-hangzhou'
        )
    
    def send_code(self, phone, code):
        request = CommonRequest()
        request.set_accept_format('json')
        request.set_domain('dysmsapi.aliyuncs.com')
        request.set_method('POST')
        request.set_protocol_type('https')
        request.set_version('2017-05-25')
        request.set_action_name('SendSms')
        
        request.add_query_param('PhoneNumbers', phone)
        request.add_query_param('SignName', current_app.config['ALIYUN_SMS_SIGN_NAME'])
        request.add_query_param('TemplateCode', current_app.config['ALIYUN_SMS_TEMPLATE_CODE'])
        request.add_query_param('TemplateParam', json.dumps({'code': code}))
        
        try:
            response = self.client.do_action_with_exception(request)
            response = json.loads(response)
            return response['Code'] == 'OK'
        except Exception as e:
            current_app.logger.error(f'发送短信失败: {str(e)}')
            return False 