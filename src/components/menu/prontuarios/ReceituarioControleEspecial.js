import React, { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import './PrintableDocumentStyles.css';
import logoClinica from '../../../img/logoprint.jpeg';
import rodapeImagem from './rodape-receita.jpg';
import { formatInTimeZone } from 'date-fns-tz';

// CSS incluído diretamente
const styles = `
.no-print {
  display: none;
}

.print-only {
  display: none;
}

@media print {
  .no-print {
    display: none;
  }
  
  .print-only {
    display: block !important;
  }
}

.modal-wrapper {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
}

.page {
  margin: 20px 0;
}

.button-container-print {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.custom-button {
  margin: 0 10px;
}

.patient-info-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.patient-info, .doctor-info {
  margin-bottom: 10px;
}

.section-content {
  margin-bottom: 20px;
}

.footer {
  text-align: center;
  margin-top: 20px;
}
`;

// Define o fuso horário
const timeZone = 'America/Sao_Paulo';

// Função para obter a data atual formatada
function getBrazilTime() {
  const now = new Date();
  return formatInTimeZone(now, timeZone, 'dd/MM/yyyy');
}

// Componente funcional para o documento imprimível
const ReceituarioControleEspecial = forwardRef(({
  open, // Estado que controla a abertura do modal
  onClose, // Função para fechar o modal
  paciente, // Dados do paciente
  conteudo, // Conteúdo a ser impresso
  titulo, // Título do documento
  medico, // Dados do médico
  includeDate, // Booleano para incluir data de impressão
  onDocumentPrinted = () => {}, // Callback após a impressão do documento (função padrão vazia)
  zIndex = 1300, // Índice Z para o modal
  tipoDocumento // Tipo do documento a ser impresso
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Índice do conteúdo atual
  const printRef = useRef(); // Referência para o elemento imprimível

  // Adicionando console.log para debug
  useEffect(() => {
    console.log('Modal open:', open);
    console.log('Paciente:', paciente);
    console.log('Conteúdo:', conteudo);
    console.log('Médico:', medico);
  }, [open, paciente, conteudo, medico]);

  // Manipulação da referência para permitir a impressão externa
  useImperativeHandle(ref, () => ({
    print: () => {
      if (printRef.current) {
        handlePrint(); // Chama a função de impressão
      } else {
        console.warn('Referência do elemento de impressão é nula.');
      }
    }
  }));

  // Função para lidar com a impressão
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Documento Médico',
    onAfterPrint: () => {
      if (conteudo && currentIndex < conteudo.length - 1) {
        setCurrentIndex(currentIndex + 1); // Avança para o próximo conteúdo
      } else {
        setCurrentIndex(0); // Reseta o índice do conteúdo
        onDocumentPrinted(titulo); // Chama o callback após a impressão
        onClose(); // Fecha o modal
      }
    },
  });

  // Efeito para acionar a impressão quando o modal é aberto
  useEffect(() => {
    if (open && conteudo && conteudo.length > 0 && printRef.current) {
      handlePrint();
    }
  }, [open, currentIndex, printRef, conteudo, handlePrint]);

  // Retorna null se o modal não estiver aberto
  if (!open) {
    return null;
  }

  // Estrutura do documento a ser impresso
  return (
    <>
      <style>{styles}</style>
      <Modal open={open} onClose={onClose} className="modal-background" sx={{ zIndex }}>
        <Box className="modal-wrapper">
          {/* Elemento imprimível */}
          <Box className="page" ref={printRef}>
            <Header />
            <DocumentTitle titulo={titulo} />
            <PatientInfo paciente={paciente} includeDate={includeDate} />
            <PrescriptionHeader tipoDocumento={tipoDocumento} />
            <PrescriptionContent conteudo={conteudo ? conteudo[currentIndex] : ''} />
            <DoctorSignature medico={medico} />
            <Footer />
          </Box>

          {/* Botões de impressão e cancelamento */}
          <Box className="button-container-print">
            <Button className="custom-button print-button" onClick={handlePrint}>
              IMPRIMIR DOCUMENTO
            </Button>
            <Button className="custom-button cancel-button" onClick={onClose}>
              CANCELAR IMPRESSÃO
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
});

// Cabeçalho do documento
const Header = () => (
  <Box className="header">
    <img className="logo" src={logoClinica} alt="Logo da Clínica" />
    <Box className="title">
      <Box component="span" className="primary-color title-text">UNNA - EXCELÊNCIA EM SAÚDE</Box>
    </Box>
  </Box>
);

// Título do documento
const DocumentTitle = ({ titulo }) => (
  <Box className="document-title">
    <Typography className="main-title">{titulo}</Typography>
  </Box>
);

// Informações do paciente e data de impressão
const PatientInfo = ({ paciente, includeDate }) => (
  <Box className="patient-info-container">
    <Box className="patient-info">
      <Typography className="label">Paciente:</Typography>
      <Typography className="info">{paciente?.nome}</Typography>
    </Box>
    {includeDate && (
      <Box className="print-date">
        <Typography className="label">Data de Impressão:</Typography>
        <Typography className="info">{getBrazilTime()}</Typography>
      </Box>
    )}
  </Box>
);

// Cabeçalho da prescrição
const PrescriptionHeader = ({ tipoDocumento }) => (
  <Box className="prescription-header">
    <Typography className="prescription-title">
      {tipoDocumento === 'exame' ? 'Exame(s):' : 'Pedido'}
    </Typography>
    <hr />
  </Box>
);

// Conteúdo da prescrição
const PrescriptionContent = ({ conteudo }) => (
  <Box className="section-content">
    <Box dangerouslySetInnerHTML={{ __html: conteudo }} />
  </Box>
);

// Assinatura do médico
const DoctorSignature = ({ medico }) => (
  <Box className="doctor-signature">
    <Box component="span" className="signature-line">____________________________</Box>
    <Box component="span" className="doctor-info">{`${medico?.nome} - CRM: ${medico?.crm}`}</Box>
  </Box>
);

// Rodapé do documento
const Footer = () => (
  <Box className="footer">
    <img className="rodape-imagem no-print" src={rodapeImagem} alt="Rodapé" />
    <img className="rodape-imagem print-only" src={rodapeImagem} alt="Rodapé" style={{ maxWidth: '100%', height: 'auto', display: 'none' }} />
    <hr />
    <Box component="span" className="footer-info">
      Rua 23 de Maio, 398 - Guararema | SP | CEP 08900-000
      <br />
      Tel: 11 2626.0606 | 99910.7781 - E-mail: contato@unnasaude.com.br
    </Box>
  </Box>
);

export default ReceituarioControleEspecial;
