
import React, { useEffect } from 'react';
import { ArrowLeft, ShieldAlert, Scale, Cookie } from 'lucide-react';
import { Reveal } from './ui/Reveal';
import { useLanguage } from '../contexts/LanguageContext';

interface LegalPageProps {
  onBack: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageProps> = ({ onBack, title, icon, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-black font-medium mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
            <Reveal width="100%">
                <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
                    <div className="p-3 bg-gray-50 rounded-2xl text-brand-black">
                        {icon}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-brand-black">{title}</h1>
                </div>
            </Reveal>
            <div className="prose prose-slate max-w-none text-gray-600 font-sans leading-relaxed">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const { language } = useLanguage();
  const brandName = language === 'zh' ? '你好老板' : 'NiHao Laoban';

  return (
    <LegalPageLayout 
      title={language === 'zh' ? '隐私政策' : 'Privacy Policy'} 
      onBack={onBack}
      icon={<ShieldAlert size={32} />}
    >
      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '1. 我们的角色' : '1. Our Role'}</h3>
        <p className="mb-4">
          {language === 'zh' 
            ? `${brandName} 仅作为连接买家、卖家和经纪人的市场平台。我们不参与用户之间的实际交易，也不是任何保密协议（NDA）或买卖合同的当事方。`
            : `${brandName} operates strictly as a marketplace platform connecting buyers, sellers, and brokers. We do not participate in actual transactions between users and are not a party to any Non-Disclosure Agreements (NDAs) or purchase contracts.`}
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '2. 信息收集与共享' : '2. Information Collection & Sharing'}</h3>
        <p className="mb-4">
          {language === 'zh'
            ? '当您通过我们的平台咨询业务时，您的联系信息将共享给相关的卖家或其授权经纪人。我们不对这些第三方收到信息后的处理行为负责。'
            : 'When you inquire about a business through our platform, your contact information is shared with the relevant seller or their authorized broker. We are not responsible for how these third parties handle your information once received.'}
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '3. 数据安全免责' : '3. Data Security Disclaimer'}</h3>
        <p className="mb-4">
          {language === 'zh'
            ? '虽然我们采取行业标准的安全措施，但互联网传输并非绝对安全。您在平台上上传的任何敏感业务数据均由您自担风险。我们不保证任何信息的绝对机密性。'
            : 'While we employ industry-standard security measures, no internet transmission is 100% secure. Any sensitive business data you upload to the platform is at your own risk. We do not guarantee absolute confidentiality of any information.'}
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '4. 第三方服务' : '4. Third-Party Services'}</h3>
        <p className="mb-4">
          {language === 'zh'
            ? '我们的服务可能包含指向不归我们所有或控制的第三方网站或服务的链接。我们对任何第三方网站的内容、隐私政策或做法不承担任何责任。'
            : 'Our services may contain links to third-party websites or services that are not owned or controlled by us. We assume no responsibility for the content, privacy policies, or practices of any third-party sites.'}
        </p>
      </section>
    </LegalPageLayout>
  );
};

export const TermsOfService: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const { language } = useLanguage();
  const brandName = language === 'zh' ? '你好老板' : 'NiHao Laoban';

  return (
    <LegalPageLayout 
      title={language === 'zh' ? '服务条款' : 'Terms of Service'} 
      onBack={onBack}
      icon={<Scale size={32} />}
    >
      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '1. 市场平台声明' : '1. Marketplace Platform Statement'}</h3>
        <p className="mb-4">
          {language === 'zh' 
            ? `${brandName} 是一个信息发布和连接平台。我们不是商业经纪公司，不提供法律、财务或税务建议。平台上的所有房源信息均由第三方提供，我们不对其准确性、合法性或盈利能力做任何保证。`
            : `${brandName} is an information and connection platform. We are not a business brokerage firm and do not provide legal, financial, or tax advice. All listing information on the platform is provided by third parties, and we make no guarantees regarding its accuracy, legality, or profitability.`}
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '2. 尽职调查义务' : '2. Due Diligence Responsibility'}</h3>
        <p className="mb-4">
          {language === 'zh'
            ? '用户必须独立进行所有必要的尽职调查。您在使用本平台信息进行任何投资决策前，应咨询专业的法律和财务顾问。任何因依赖平台信息而导致的财务损失，我们概不负责。'
            : 'Users must independently conduct all necessary due diligence. You should consult professional legal and financial advisors before making any investment decisions based on platform information. We are not liable for any financial loss resulting from reliance on platform information.'}
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '3. 责任限制' : '3. Limitation of Liability'}</h3>
        <p className="mb-4 font-bold text-red-600">
          {language === 'zh'
            ? '在法律允许的最大范围内，对于任何间接、偶然、特别、后果性或惩罚性的损害，或任何利润或收入损失，无论是否直接发生，或由于您的使用或无法使用服务而导致的任何数据、使用、商誉或其他无形损失，我们均不承担责任。'
            : 'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use or inability to use the services.'}
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">{language === 'zh' ? '4. 赔偿条款' : '4. Indemnification'}</h3>
        <p className="mb-4">
          {language === 'zh'
            ? '您同意就任何因您违反本条款或您在平台上的行为（包括但不限于虚假陈述、违反保密协议或违约）而引起的索赔、损害、义务、损失、责任、成本或债务及支出，对我们进行赔偿并使其免受损害。'
            : 'You agree to indemnify and hold us harmless from any claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from your violation of these terms or your actions on the platform, including but not limited to misrepresentations, breaches of NDAs, or breach of contract.'}
        </p>
      </section>
    </LegalPageLayout>
  );
};

export const CookieSettings: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const { language } = useLanguage();
  
  return (
    <LegalPageLayout 
      title={language === 'zh' ? 'Cookie 设置' : 'Cookie Settings'} 
      onBack={onBack}
      icon={<Cookie size={32} />}
    >
      <p className="mb-8 text-lg">
        {language === 'zh' 
          ? '我们使用 cookie 来增强您在我们网站上的体验并分析我们的流量。您可以在下面管理您的偏好。' 
          : 'We use cookies to enhance your experience on our website and analyze our traffic. You can manage your preferences below.'}
      </p>
      
      <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
              <div>
                  <h4 className="font-bold text-black text-lg">{language === 'zh' ? '必要 Cookies' : 'Essential Cookies'}</h4>
                  <p className="text-sm text-gray-500">{language === 'zh' ? '这些 cookie 对网站运行至关重要，无法禁用。' : 'These cookies are essential for the website to function and cannot be disabled.'}</p>
              </div>
              <div className="w-12 h-6 bg-brand-black rounded-full relative shadow-inner"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div></div>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
              <div>
                  <h4 className="font-bold text-black text-lg">{language === 'zh' ? '分析 Cookies' : 'Analytics Cookies'}</h4>
                  <p className="text-sm text-gray-500">{language === 'zh' ? '帮助我们了解访客如何使用网站，以便我们改进服务。' : 'Help us understand how visitors use the site so we can improve our services.'}</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer hover:bg-gray-400 transition-colors"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div></div>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
              <div>
                  <h4 className="font-bold text-black text-lg">{language === 'zh' ? '偏好 Cookies' : 'Preference Cookies'}</h4>
                  <p className="text-sm text-gray-500">{language === 'zh' ? '用于记住您的语言选择和其他个性化设置。' : 'Used to remember your language choices and other personalized settings.'}</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer hover:bg-gray-400 transition-colors"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div></div>
          </div>
          
          <div className="pt-6">
            <button className="w-full md:w-auto bg-brand-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-xl shadow-black/10">
              {language === 'zh' ? '保存设置' : 'Save Preferences'}
            </button>
          </div>
      </div>
      
      <div className="mt-12 p-6 bg-yellow-50 rounded-2xl border border-yellow-100 text-sm text-yellow-800 italic">
        {language === 'zh'
          ? '注意：禁用某些 cookie 可能会影响您在平台上的体验。我们绝不会出于营销目的向第三方出售您的个人数据。'
          : 'Note: Disabling certain cookies may impact your experience on the platform. We never sell your personal data to third parties for marketing purposes.'}
      </div>
    </LegalPageLayout>
  );
};
