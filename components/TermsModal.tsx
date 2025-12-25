import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy';
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#161b2e] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {type === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none">
                    <div className="text-slate-300 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: content }} />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5">
                    <Button fullWidth onClick={onClose} variant="neon">
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
};

const TERMS_CONTENT = `
<h3>Última atualização: 25 de dezembro de 2024</h3>
<p>Bem-vindo ao <strong>Vou Lá</strong>! Estes Termos de Uso ("Termos") regem o seu acesso e uso do aplicativo Vou Lá e seus serviços relacionados.</p>

<h4>1. Aceitação dos Termos</h4>
<p>Ao acessar ou usar o Vou Lá, você concorda em cumprir e estar vinculado a estes Termos de Uso e à nossa Política de Privacidade.</p>

<h4>2. Descrição do Serviço</h4>
<p>O Vou Lá é uma plataforma social que permite aos usuários descobrir estabelecimentos locais, visualizar informações em tempo real, fazer check-in, interagir com outros usuários e participar de desafios.</p>

<h4>3. Requisitos de Elegibilidade</h4>
<p>Para usar o Vou Lá, você deve:</p>
<ul>
  <li>Ter pelo menos <strong>18 anos de idade</strong></li>
  <li>Fornecer informações verdadeiras e precisas durante o cadastro</li>
  <li>Manter suas informações de conta atualizadas</li>
  <li>Ser responsável pela segurança de sua senha</li>
</ul>

<h4>4. Uso Aceitável</h4>
<p>Você concorda em NÃO:</p>
<ul>
  <li>Usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
  <li>Publicar conteúdo ofensivo, difamatório, obsceno ou discriminatório</li>
  <li>Assediar, intimidar ou ameaçar outros usuários</li>
  <li>Fazer-se passar por outra pessoa ou entidade</li>
  <li>Interferir ou interromper o funcionamento do serviço</li>
</ul>

<h4>5. Dados de Localização</h4>
<p>O Vou Lá utiliza dados de localização para fornecer funcionalidades como mostrar estabelecimentos próximos e permitir check-ins baseados em geolocalização.</p>

<h4>6. Propriedade Intelectual</h4>
<p>O Vou Lá e todo o seu conteúdo são de propriedade da empresa e são protegidos por leis de direitos autorais e marcas registradas.</p>

<h4>7. Limitação de Responsabilidade</h4>
<p>O Vou Lá é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será ininterrupto ou livre de erros.</p>

<h4>8. Contato</h4>
<p>Para dúvidas sobre estes Termos de Uso, entre em contato: <strong>contato@voula.app</strong></p>
`;

const PRIVACY_CONTENT = `
<h3>Última atualização: 25 de dezembro de 2024</h3>
<p>A sua privacidade é importante para nós. Esta Política de Privacidade explica como o <strong>Vou Lá</strong> coleta, usa, armazena e protege suas informações pessoais, em conformidade com a LGPD.</p>

<h4>1. Informações que Coletamos</h4>
<p>Quando você cria uma conta, coletamos:</p>
<ul>
  <li>Nome completo, e-mail, telefone, idade e cidade</li>
  <li>Foto de perfil e biografia (opcional)</li>
  <li>Dados de localização (GPS)</li>
  <li>Dados de uso e interações com o app</li>
  <li>Informações do dispositivo</li>
</ul>

<h4>2. Como Usamos Suas Informações</h4>
<p>Usamos suas informações para:</p>
<ul>
  <li>Fornecer e melhorar o serviço</li>
  <li>Processar check-ins e mostrar estabelecimentos próximos</li>
  <li>Enviar notificações e atualizações</li>
  <li>Prevenir fraudes e atividades ilegais</li>
  <li>Personalizar sua experiência</li>
</ul>

<h4>3. Compartilhamento de Informações</h4>
<p>Compartilhamos informações com:</p>
<ul>
  <li><strong>Outros usuários:</strong> nome, foto e check-ins (conforme suas configurações)</li>
  <li><strong>Estabelecimentos:</strong> informações de check-in</li>
  <li><strong>Prestadores de serviços:</strong> Supabase, serviços de análise</li>
</ul>
<p><strong>Nunca vendemos seus dados para terceiros.</strong></p>

<h4>4. Seus Direitos (LGPD)</h4>
<p>Você tem direito a:</p>
<ul>
  <li>Acessar, corrigir ou excluir seus dados</li>
  <li>Solicitar portabilidade de dados</li>
  <li>Revogar consentimento a qualquer momento</li>
  <li>Opor-se ao tratamento de dados</li>
</ul>

<h4>5. Segurança dos Dados</h4>
<p>Implementamos criptografia, controle de acesso e monitoramento para proteger suas informações.</p>

<h4>6. Dados de Localização</h4>
<p>Você pode controlar o acesso à localização nas configurações do dispositivo e usar o "Modo Fantasma" para ocultar sua localização.</p>

<h4>7. Privacidade de Menores</h4>
<p>O Vou Lá é destinado a usuários com <strong>18 anos ou mais</strong>.</p>

<h4>8. Contato</h4>
<p>Para questões sobre privacidade: <strong>privacidade@voula.app</strong></p>
<p>DPO: <strong>dpo@voula.app</strong></p>
`;
