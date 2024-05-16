import React, { useEffect, useState, forwardRef } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import './PrintableDocumentStyles.css';
import logoClinica from '../../../img/logoprint.jpeg';
import { formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';  // Corrigido para importar do pacote correto

const timeZone = 'America/Sao_Paulo';

// Função para obter a data atual formatada
function getBrazilTime() {
  const now = new Date();
  return formatInTimeZone(now, timeZone, 'dd/MM/yyyy');
}

// Função para validar e formatar data
function getFormattedDate(date) {
  const parsedDate = parseISO(date);
  if (isValid(parsedDate)) {
    return formatInTimeZone(parsedDate, timeZone, 'dd/MM/yyyy');
  } else {
    return 'Data inválida';
  }
}

const PrintableDocument = forwardRef(({ open, onClose, paciente, conteudo, titulo, medico, includeDate, onDocumentPrinted, zIndex = 1300 }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Função para lidar com a impressão
  const handlePrint = useReactToPrint({
    content: () => {
      if (ref && ref.current) {
        return ref.current;
      } else {
        console.warn('Referência do elemento de impressão é nula.');
        return null;
      }
    },
    documentTitle: 'Documento Médico',
    onAfterPrint: () => {
      if (currentIndex < conteudo.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
        onDocumentPrinted(titulo);
        onClose(); // Fecha o modal após a impressão
      }
    },
  });

  // Efeito para acionar a impressão quando o modal é aberto
  useEffect(() => {
    if (open && conteudo && conteudo.length > 0 && ref && ref.current) {
      handlePrint();
    }
  }, [open, currentIndex]);

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} className="modal-background" sx={{ zIndex }}>
      <Box className="modal-wrapper">
        <Box className="page" ref={ref}>
          <Box className="header">
            <img className="logo" src={logoClinica} alt="Logo da Clínica" />
            <Box className="title">
              <Box component="span" className="primary-color">UNNA - EXCELÊNCIA EM SAÚDE</Box>
            </Box>
          </Box>

          <Box className="content">
            {/* Linha sutil acima do título */}
            <Box className="subtle-line"></Box>
            
            {/* Centraliza o título com a classe .main-title */}
            <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
              <Typography className="main-title">{titulo}</Typography>
            </Box>

            <Box className="section-content">
              <Box className="section-title">Paciente:</Box>
              <Box>{paciente?.nome}</Box>
            </Box>

            <Box className="prescription-header">
              <Typography className="prescription-title">
                {titulo === 'Solicitação de exame' ? 'Pedido de Exame' : 'Prescrição'}
              </Typography>
              {includeDate && (
                <Typography className="print-date">Data de Impressão: {getBrazilTime()}</Typography>
              )}
            </Box>
            <hr />

            <Box className="section-content">
              <Box dangerouslySetInnerHTML={{ __html: conteudo[currentIndex] }} />
            </Box>
          </Box>

          <Box className="spacer"></Box> {/* Adiciona o espaçamento extra */}

          <Box className="doctor-info">
            <Box component="span">{`Dr(a). ${medico?.nome} - CRM: ${medico?.crm}`}</Box>
          </Box>

          <Box className="doctor-signature">
            <Box component="span" className="signature-line">____________________________</Box>
            <Box component="span" className="signature-label">Assinatura do Médico</Box>
          </Box>

          <Box className="footer">
            <hr />
            <Box component="span" sx={{ display: 'block', textAlign: 'center' }}>
              Rua 23 de Maio, 398 - Guararema | SP | CEP 08900-000
              <br />
              Tel: 11 2626.0606 | 99910.7781 - E-mail: contato@unnasaude.com.br
            </Box>
          </Box>
        </Box>

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
