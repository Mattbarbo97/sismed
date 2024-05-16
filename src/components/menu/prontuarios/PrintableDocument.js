import React, { useRef, useState } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { useLocation, useNavigate } from 'react-router-dom';
import './PrintableDocumentStyles.css';
import logoClinica from '../../../img/logoprint.jpeg';
import { formatInTimeZone } from 'date-fns-tz';

const timeZone = 'America/Sao_Paulo';

function getBrazilTime() {
  const now = new Date();
  return formatInTimeZone(now, timeZone, 'dd/MM/yyyy');
}

const PrintableDocument = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { open, paciente, conteudo, titulo, medico, includeDate } = location.state || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Documento Médico',
    onAfterPrint: () => {
      if (currentIndex < conteudo.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        navigate(-1);  // Voltar para a página anterior
        setCurrentIndex(0);
      }
    },
  });
   // eslint-disable-next-line
  useEffect(() => {
    if (open && conteudo && conteudo.length > 0) {
      handlePrint();
    }
    // eslint-disable-next-line
  }, [open, currentIndex]);

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={() => navigate(-1)} className="modal-background">
      <Box className="modal-wrapper">
        <Box className="page" ref={componentRef}>
          <Box className="header">
            <img className="logo" src={logoClinica} alt="Logo da Clínica" />
            <Box className="title">
              <Box component="span" className="primary-color">UNNA - EXCELÊNCIA EM SAÚDE</Box>
            </Box>
          </Box>

          <Box className="content">
            <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
              <Typography variant="h4" className="main-title">{titulo}</Typography>
            </Box>
            <Box className="section-content">
              <Box className="section-title">Paciente:</Box>
              <Box>{paciente?.nome}</Box>
            </Box>

            <Box className="prescription-header">
              <Typography className="prescription-title">
                {titulo === 'Pedido de Exame' ? 'Solicitação' : 'Prescrição'}
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
          <Button className="custom-button cancel-button" onClick={() => navigate(-1)}>
            CANCELAR IMPRESSÃO
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PrintableDocument;
