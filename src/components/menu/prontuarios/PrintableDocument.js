import React, { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import './PrintableDocumentStyles.css';
import logoClinica from '../../../img/logoprint.jpeg';
import { formatInTimeZone } from 'date-fns-tz';
// eslint-disable-next-line
import { parseISO, isValid } from 'date-fns';

// Define o fuso horário
const timeZone = 'America/Sao_Paulo';

// Função para obter a data atual formatada
function getBrazilTime() {
  const now = new Date();
  return formatInTimeZone(now, timeZone, 'dd/MM/yyyy');
}

// Componente funcional para o documento imprimível
const PrintableDocument = forwardRef(({
  open, // Estado que controla a abertura do modal
  onClose, // Função para fechar o modal
  paciente, // Dados do paciente
  conteudo, // Conteúdo a ser impresso
  titulo, // Título do documento
  medico, // Dados do médico
  includeDate, // Booleano para incluir data de impressão
  onDocumentPrinted, // Callback após a impressão do documento
  zIndex = 1300 // Índice Z para o modal
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Índice do conteúdo atual
  const printRef = useRef(); // Referência para o elemento imprimível

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
      if (currentIndex < conteudo.length - 1) {
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
    <Modal open={open} onClose={onClose} className="modal-background" sx={{ zIndex }}>
      <Box className="modal-wrapper">
        {/* Elemento imprimível */}
        <Box className="page" ref={printRef}>
          {/* Cabeçalho do documento */}
          <Box className="header">
            <img className="logo" src={logoClinica} alt="Logo da Clínica" />
            <Box className="title">
              <Box component="span" className="primary-color">UNNA - EXCELÊNCIA EM SAÚDE</Box>
            </Box>
          </Box>

          {/* Conteúdo do documento */}
          <Box className="content">
            {/* Linha sutil */}
            <Box className="subtle-line"></Box>
            <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
              <Typography className="main-title">{titulo}</Typography>
            </Box>

            {/* Informações do paciente */}
            <Box className="section-content">
              <Box className="section-title">Paciente:</Box>
              <Box>{paciente?.nome}</Box>
            </Box>

            {/* Cabeçalho da prescrição */}
            <Box className="prescription-header">
              <Typography className="prescription-title">
                {titulo === 'Solicitação de exame' ? 'Pedido de Exame' : 'Prescrição'}
              </Typography>
              {includeDate && (
                <Typography className="print-date">Data de Impressão: {getBrazilTime()}</Typography>
              )}
            </Box>
            <hr />

            {/* Conteúdo da prescrição */}
            <Box className="section-content">
              <Box dangerouslySetInnerHTML={{ __html: conteudo[currentIndex] }} />
            </Box>
          </Box>

          {/* Espaçamento */}
          <Box className="spacer"></Box>

          {/* Assinatura do médico e informações */}
          <Box className="doctor-signature">
            <Box component="span" className="signature-line">____________________________</Box>
            <Box component="span" className="doctor-info">{`Dr(a). ${medico?.nome} - CRM: ${medico?.crm}`}</Box>
          </Box>

          {/* Rodapé do documento */}
          <Box className="footer">
            <hr />
            <Box component="span" sx={{ display: 'block', textAlign: 'center' }}>
              Rua 23 de Maio, 398 - Guararema | SP | CEP 08900-000
              <br />
              Tel: 11 2626.0606 | 99910.7781 - E-mail: contato@unnasaude.com.br
            </Box>
          </Box>
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
  );
});

export default PrintableDocument;
