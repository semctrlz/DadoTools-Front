/* eslint-disable no-case-declarations */
/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/prop-types */
/* eslint-disable no-plusplus */
import React, { useState, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import filesize from 'filesize';
import { useSelector } from 'react-redux';
import { parseISO, format, formatDistance } from 'date-fns';
import ReactHtmlParser from 'react-html-parser';
import { stateToHTML } from 'draft-js-export-html';
import pt from 'date-fns/locale/pt';
import {
  FiUser,
  FiFolder,
  FiFilter,
  FiInbox,
  FiAlertCircle,
  FiClock,
  FiChevronsUp,
} from 'react-icons/fi';
import {
  AiOutlineLoading3Quarters,
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from 'react-icons/ai';
import { toast } from 'react-toastify';

import Modal from 'react-modal';

import {
  MdAttachFile,
  MdCloudUpload,
  MdClear,
  MdClose,
  MdExpandLess,
  MdExpandMore,
  MdLabelOutline,
  MdCheckCircle,
  MdError,
} from 'react-icons/md';
import {
  Editor,
  EditorState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
} from 'draft-js';
import api from '~/services/api';

import { Container, Sidebar, Body } from './styles';
import './styles.css';

import {
  RetornaIconeDaExtensao,
  ExtensaoValidaUpload,
  extensoesValidas as ext,
  FormataFileSize,
} from '~/Utils';

import Avatar from '~/components/Avatar';
import Negrito from '~/assets/Negrito.svg';
import Italico from '~/assets/Italico.svg';
import Sublinhado from '~/assets/Sublinhado.svg';

const estiloModalTicket = {
  content: {
    maxWidth: '900px',
    width: '100%',
    height: '90%',
    marginRight: 'auto',
    marginLeft: 'auto',
    padding: 0,
    overflow: 'none',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
};
const estiloModalEncerramento = {
  content: {
    maxWidth: '500px',
    width: '100%',
    maxHeight: '250px',
    height: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
    padding: 0,
    overflow: 'none',
  },
};

const tamanhoLimiteTexto = 1000;

export default function Inbox() {
  const profile = useSelector(state => state.user.profile);

  const [file1, setFile1] = useState({
    file: null,
    nome: '',
    tamanho: 0,
    tamanhoFormatado: '',
    progress: 0,
    uploaded: false,
    error: false,
    idupload: '',
    url: '',
  });

  const [file2, setFile2] = useState({
    file: null,
    nome: '',
    tamanho: 0,
    tamanhoFormatado: '',
    progress: 0,
    uploaded: false,
    error: false,
    idupload: '',
    url: '',
  });

  const [file3, setFile3] = useState({
    file: null,
    nome: '',
    tamanho: 0,
    tamanhoFormatado: '',
    progress: 0,
    uploaded: false,
    error: false,
    idupload: '',
    url: '',
  });

  const [criandoUpdate, setCriandoUpdate] = useState(false);
  const [upload, setUpload] = useState([]);

  const [textoEncerramento, setTextoEncerramento] = useState('');

  const [colunaOrd, setColunaOrd] = useState('');
  const [colunaOrdAsc, setColunaOrdAsc] = useState(true);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalEncerramentoIsOpen, setModalEncerramentoIsOpen] = useState(false);

  const [updates, setUpdates] = useState([]);
  const [criador, setCriador] = useState({});
  const [destinatario, setDestinatario] = useState({});
  const [ordemDesc, setOrdemDesc] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [ticket, setTicket] = useState({});
  const [tickets_, setTickets_] = useState([]);
  const [estado, setEstado] = useState(EditorState.createEmpty());
  const [characteresDisp, setCharacteresDisp] = useState(tamanhoLimiteTexto);
  const [texto, setTexto] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [extensoesValidas, setExtensoesValidas] = useState([]);
  const [resumoDados, setResumoDados] = useState({
    vencidos: 0,
    prazo_curto: 0,
    prioritario: 0,
  });

  async function updateResumos(dados) {
    const array = [];
    dados.forEach(t => {
      array.push({
        categoria: t.categoria,
        subcategoria: `${t.categoria}@#${t.subcategoria}`,
      });
    });

    const resumo = await {
      vencidos: dados.filter(t => {
        if (t.prazo) {
          return new Date(t.prazo) < new Date();
        }
        return false;
      }).length,
      prazo_curto: dados.filter(t => {
        if (t.prazo && new Date(t.prazo) >= new Date()) {
          if (new Date(t.prazo) === new Date()) {
            return true;
          }
          const diffTime_p = Math.abs(
            new Date(t.prazo) - new Date(t.createdAt)
          );
          const diffDays_p = Math.ceil(diffTime_p / (1000 * 60 * 60 * 24));

          const diffTime_d = Math.abs(new Date() - new Date(t.createdAt));
          const diffDays_d = Math.ceil(diffTime_d / (1000 * 60 * 60 * 24));

          if (diffDays_d / diffDays_p > 0.8) {
            return true;
          }
          return false;
        }

        return false;
      }).length,
      prioritario: dados.filter(t => {
        return t.prioridade === 'A' || t.prioridade === 'U';
      }).length,
    };
    setResumoDados(resumo);

    const categ = await Object.values(
      array.reduce((c, { categoria }) => {
        c[categoria] = c[categoria] || {
          name: categoria,
          value: 0,
        };
        c[categoria].value++;
        return c;
      }, {})
    );
    setCategorias(categ);

    const subcateg = await Object.values(
      array.reduce((c, { subcategoria }) => {
        c[subcategoria] = c[subcategoria] || {
          name: subcategoria,
          value: 0,
        };
        c[subcategoria].value++;
        return c;
      }, {})
    );

    const sub = [];
    subcateg.forEach(valor => {
      const [categoria_, subcategoria_] = String(valor.name).split('@#');
      sub.push({
        categoria: categoria_,
        subcategoria: subcategoria_,
        quant: valor.value,
      });
    });
    setSubcategorias(sub);
  }

  useEffect(() => {
    async function atualizaInbox() {
      const retorno = await api.get('tickets/inbox');
      setTickets(retorno.data);
      setTickets_(retorno.data);

      updateResumos(retorno.data);

      setExtensoesValidas(ext.map(i => `.${i}`).join(','));
    }

    atualizaInbox();
  }, []);

  function OrdenaTicket(asc) {
    switch (colunaOrd) {
      case 'assunto':
        if (asc) {
          setTickets(
            tickets_.sort((a, b) =>
              String(a.assunto).toLowerCase() < String(b.assunto).toLowerCase()
                ? -1
                : 1
            )
          );
        } else {
          setTickets(
            tickets_.sort((a, b) =>
              String(a.assunto).toLowerCase() < String(b.assunto).toLowerCase()
                ? 1
                : -1
            )
          );
        }
        break;
      case 'prioridade':
        if (asc) {
          setTickets(
            tickets_.sort((a, b) =>
              a.prioridade_num < b.prioridade_num ? -1 : 1
            )
          );
        } else {
          setTickets(
            tickets_.sort((a, b) =>
              a.prioridade_num < b.prioridade_num ? 1 : -1
            )
          );
        }
        break;
      case 'status':
        if (asc) {
          setTickets(
            tickets_.sort((a, b) => {
              if (
                String(a.status).toLowerCase() < String(b.status).toLowerCase()
              ) {
                return -1;
              }
              if (
                String(a.status).toLowerCase() > String(b.status).toLowerCase()
              ) {
                return 1;
              }
              return 0;
            })
          );
        } else {
          setTickets(
            tickets_.sort((a, b) => {
              if (
                String(a.status).toLowerCase() < String(b.status).toLowerCase()
              ) {
                return 1;
              }
              if (
                String(a.status).toLowerCase() > String(b.status).toLowerCase()
              ) {
                return -1;
              }
              return 0;
            })
          );
        }
        break;
      case 'prazo':
        if (asc) {
          setTickets(tickets_.sort((a, b) => (a.prazo < b.prazo ? -1 : 1)));
        } else {
          setTickets(tickets_.sort((a, b) => (a.prazo < b.prazo ? 1 : -1)));
        }
        break;
      case 'atualizado':
        if (asc) {
          setTickets(
            tickets_.sort(function (a, b) {
              if (a.updates[0] && b.updates[0]) {
                return a.updates[0].createdAt < b.updates[0].createdAt ? -1 : 1;
              }
              return a.updatedAt < b.updatedAt ? -1 : 1;
            })
          );
        } else {
          setTickets(
            tickets_.sort(function (a, b) {
              if (a.updates[0] && b.updates[0]) {
                return a.updates[0].createdAt < b.updates[0].createdAt ? 1 : -1;
              }
              return a.updatedAt < b.updatedAt ? 1 : -1;
            })
          );
        }
        break;

      case 'data':
        if (asc) {
          setTickets(
            tickets_.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
          );
        } else {
          setTickets(
            tickets_.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
          );
        }
        break;
      default:
        break;
    }
  }

  async function closeModal() {
    setModalIsOpen(false);
    setEstado(EditorState.createEmpty());
    setCharacteresDisp(tamanhoLimiteTexto);
    setAnexos([]);
    setTexto('');

    const retorno = await api.get('tickets/inbox');
    await setTickets_(retorno.data);
    OrdenaTicket();
    updateResumos(retorno.data);
    setCriandoUpdate(false);

    if (file1.idupload !== '') {
      api.delete(`upload/${file1.idupload}`);
    }

    if (file2.idupload !== '') {
      api.delete(`upload/${file2.idupload}`);
    }

    if (file3.idupload !== '') {
      api.delete(`upload/${file3.idupload}`);
    }

    setFile1({
      file: null,
      nome: '',
      tamanho: 0,
      tamanhoFormatado: '',
      progress: 0,
      uploaded: false,
      error: false,
      idupload: '',
      url: '',
    });
    setFile2({
      file: null,
      nome: '',
      tamanho: 0,
      tamanhoFormatado: '',
      progress: 0,
      uploaded: false,
      error: false,
      idupload: '',
      url: '',
    });
    setFile3({
      file: null,
      nome: '',
      tamanho: 0,
      tamanhoFormatado: '',
      progress: 0,
      uploaded: false,
      error: false,
      idupload: '',
      url: '',
    });
  }

  function getTipoLabel(t) {
    const idUsuario = profile.id;

    let tipo = 'N';
    if (t.updates.length > 0) {
      const id_update = t.updates[0].id_usuario;
      if (id_update !== idUsuario) {
        tipo = 'C';
      } else {
        tipo = 'V';
      }
    }
    /*
    Pode ser:
    N = novo (sem updates)
    C = Atualizado pelo criador
    V = Atualizado por você
    */
    switch (tipo) {
      case 'C':
        return <span className="label blue">criador atualizou</span>;
      case 'V':
        return <span className="label green">você atualizou</span>;

      default:
        return <span className="label yellow">Novo</span>;
    }
  }

  function getPrioridadeLabel(prioridade) {
    switch (prioridade) {
      case 'B':
        return <p className="baixa">Baixa</p>;
      case 'A':
        return <p className="alta">Alta</p>;
      case 'U':
        return <p className="urgente">Urgente</p>;
      default:
        return <p className="normal">Normal</p>;
    }
  }

  function getStatusLabel(t) {
    /*
    Pode ser:
    Inicial (Aberto e não vencido)
    VEncido (Aberto e vencido)
    Finalizado
    Excluído
    */
    const { status } = t;
    const { prazo: prazo_original = '' } = t;
    const prazo = new Date(prazo_original);

    switch (status) {
      case 'F':
        return <p className="finalizadao">Finalizado</p>;
      case 'E':
        return <p className="excluído">Excluído</p>;
      case 'I':
        if (prazo_original) {
          if (prazo < new Date()) {
            return <p className="vencido">Vencido</p>;
          }
          return <p className="inicial">Inicial</p>;
        }

        return <p className="inicial">Inicial</p>;

      default:
        return <p className="inicial">Inicial</p>;
    }
  }

  function DateDiff(dataI, dataF) {
    const diffTime = Math.abs(dataF - dataI);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getPrazoLabel(t) {
    const { prazo: prazo_orig = '', createdAt } = t;

    if (prazo_orig) {
      // Calcular se está vencido

      const criacao = new Date(createdAt);
      const prazo = new Date(prazo_orig);
      if (prazo < new Date()) {
        return (
          <p className="vencido" title="Ticket vencido">
            {format(parseISO(prazo_orig), 'dd/MM/YYY HH:mm')}
          </p>
        );
      }
      const diferencaTotalDias = DateDiff(criacao, prazo);
      const diferencaAtual = DateDiff(criacao, new Date());

      if (prazo === new Date()) {
        return (
          <p className="quase_vencendo" title="Ticket perto de vencer">
            {format(parseISO(prazo_orig), 'dd/MM/YYY HH:mm')}
          </p>
        );
      }
      if (diferencaAtual / diferencaTotalDias > 0.8) {
        return (
          <p className="quase_vencendo" title="Ticket perto de vencer">
            {format(parseISO(prazo_orig), 'dd/MM/YYY HH:mm')}
          </p>
        );
      }
      return (
        <p className="normal" title="Ticket perto de vencer">
          {format(parseISO(prazo_orig), 'dd/MM/YYY HH:mm')}
        </p>
      );
    }

    return '';
  }

  function getAtualizado(t) {
    if (t.updates.length > 0) {
      const { updatedAt } = t.updates[0];
      return (
        <p>
          {formatDistance(parseISO(updatedAt), new Date(), {
            addSuffix: true,
            locale: pt,
          })}
        </p>
      );
    }
    // Data de Last Update
    return (
      <p>
        {formatDistance(parseISO(t.updatedAt), new Date(), {
          addSuffix: true,
          locale: pt,
        })}
      </p>
    );
  }

  function filterCategoria(e) {
    // const { nome } = e.target.dataset;
    setTickets(
      tickets_.filter(t => {
        return t.categoria === e;
      })
    );
  }

  function filterSubcategoria(cat, subcat) {
    setTickets(
      tickets_.filter(t => {
        return t.categoria === cat && t.subcategoria === subcat;
      })
    );
  }

  function afterOpenModal() {}

  async function CarregarTicket(id) {
    const response = await api.get(`tickets/inbox/${id}`);

    if (response.data && response.data.id > 0) {
      setTicket(response.data);
      setModalIsOpen(true);
    } else {
      setTicket({});
      setModalIsOpen(false);
    }

    setUpdates(
      response.data.updates.sort((a, b) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? -1 : +1
      )
    );

    setCriador(response.data.criador);
    setDestinatario(response.data.destinatario);
  }

  function LimparDadosUpdate() {
    setTexto('');
    setUpload([]);
    setEstado(EditorState.createEmpty());
    setCharacteresDisp(tamanhoLimiteTexto);
  }

  function existeUpload() {
    return (
      (file1.file && !file1.uploaded && !file1.error) ||
      (file2.file && !file2.uploaded && !file2.error) ||
      (file3.file && !file3.uploaded && !file3.error)
    );
  }

  async function HandleUpdate(e) {
    if (existeUpload()) {
      toast.info('Espere o upload terminar antes de salvar.');
      return;
    }

    if (criandoUpdate) {
      return;
    }

    if (texto.length === 0) {
      toast.warn('Escreva um texto para realizar o update.');
      return;
    }

    setCriandoUpdate(true);
    e.preventDefault();
    const texto_json = JSON.stringify(convertToRaw(estado.getCurrentContent()));
    const id_ticket = ticket.id;

    const dadosEnvio = {
      id_ticket,
      texto,
      texto_json,
    };

    if (file1.file !== null) {
      dadosEnvio.anexo1 = file1;
      setFile1({
        file: null,
        nome: '',
        tamanho: 0,
        tamanhoFormatado: '',
        progress: 0,
        uploaded: false,
        error: false,
        idupload: '',
        url: '',
      });
    }
    if (file2.file !== null) {
      dadosEnvio.anexo2 = file2;
      setFile2({
        file: null,
        nome: '',
        tamanho: 0,
        tamanhoFormatado: '',
        progress: 0,
        uploaded: false,
        error: false,
        idupload: '',
        url: '',
      });
    }
    if (file3.file !== null) {
      dadosEnvio.anexo3 = file3;
      setFile3({
        file: null,
        nome: '',
        tamanho: 0,
        tamanhoFormatado: '',
        progress: 0,
        uploaded: false,
        error: false,
        idupload: '',
        url: '',
      });
    }

    await api.post('/tickets/updates', dadosEnvio);

    CarregarTicket(id_ticket);
    LimparDadosUpdate();
    toast.success('Update criado com sucesso!');
    setCriandoUpdate(false);
  }

  function IconeAnexo(arquivo) {
    const re = /(?:\.([^.]+))?$/;

    const exten = re.exec(arquivo)[1];
    return RetornaIconeDaExtensao(exten);
  }

  function onChange(editorState) {
    setEstado(editorState);
    setTexto(editorState.getCurrentContent().getPlainText());

    setCharacteresDisp(
      tamanhoLimiteTexto - editorState.getCurrentContent().getPlainText().length
    );
  }

  // eslint-disable-next-line consistent-return
  function handleBeforeChange() {
    if (characteresDisp <= 0) {
      return 'handled';
    }
  }

  function _getLengthOfSelectedText() {
    const currentSelection = estado.getSelection();
    const isCollapsed = currentSelection.isCollapsed();

    let length = 0;

    if (!isCollapsed) {
      const currentContent = estado.getCurrentContent();
      const startKey = currentSelection.getStartKey();
      const endKey = currentSelection.getEndKey();
      const startBlock = currentContent.getBlockForKey(startKey);
      const isStartAndEndBlockAreTheSame = startKey === endKey;
      const startBlockTextLength = startBlock.getLength();
      const startSelectedTextLength =
        startBlockTextLength - currentSelection.getStartOffset();
      const endSelectedTextLength = currentSelection.getEndOffset();
      const keyAfterEnd = currentContent.getKeyAfter(endKey);
      if (isStartAndEndBlockAreTheSame) {
        length +=
          currentSelection.getEndOffset() - currentSelection.getStartOffset();
      } else {
        let currentKey = startKey;

        while (currentKey && currentKey !== keyAfterEnd) {
          if (currentKey === startKey) {
            length += startSelectedTextLength + 1;
          } else if (currentKey === endKey) {
            length += endSelectedTextLength;
          } else {
            length += currentContent.getBlockForKey(currentKey).getLength() + 1;
          }

          currentKey = currentContent.getKeyAfter(currentKey);
        }
      }
    }

    return length;
  }

  // eslint-disable-next-line consistent-return
  function _handlePastedText(pastedText) {
    const currentContent = estado.getCurrentContent();
    const currentContentLength = currentContent.getPlainText('').length;
    const selectedTextLength = _getLengthOfSelectedText();

    if (
      currentContentLength + pastedText.length - selectedTextLength >
      tamanhoLimiteTexto
    ) {
      toast.warn(
        `O tamanho máximo neste formulário é de ${tamanhoLimiteTexto} caracteres. Colando este conteúdo você ultrapassará este limite.`
      );

      return 'handled';
    }
  }

  function toggleLimit() {
    if (characteresDisp <= 0) {
      return `Você excedeu o limite. O texto vai ser salvo até os ${tamanhoLimiteTexto} primeiros caracteres`;
    }
    return `Limite: ${tamanhoLimiteTexto} | ${characteresDisp}`;
  }

  // Funções do editor
  function handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(estado, command);
    if (newState) {
      onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  function onUnderlineClick() {
    onChange(RichUtils.toggleInlineStyle(estado, 'UNDERLINE'));
  }

  function onBoldClick() {
    onChange(RichUtils.toggleInlineStyle(estado, 'BOLD'));
  }

  function onItalicClick() {
    onChange(RichUtils.toggleInlineStyle(estado, 'ITALIC'));
  }

  function AlternaOrdem() {
    const ordem = ordemDesc;

    setOrdemDesc(!ordem);
    if (!ordem) {
      setUpdates(
        updates.sort((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? -1 : +1
        )
      );
    } else {
      setUpdates(
        updates.sort((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? +1 : -1
        )
      );
    }
  }

  function PrazoLabel() {
    const { prazo: prazo_orig, createdAt } = ticket;
    if (prazo_orig) {
      // Calcular se está vencido

      const criacao = new Date(createdAt);
      const prazo = new Date(prazo_orig);
      if (prazo < new Date()) {
        return (
          <span className="prazo vencido">
            <strong>Prazo:</strong>{' '}
            <p>{format(parseISO(prazo_orig), 'dd/MM/YYY')}</p>
          </span>
        );
      }
      const diferencaTotalDias = DateDiff(criacao, prazo);
      const diferencaAtual = DateDiff(criacao, new Date());

      if (prazo === new Date()) {
        return (
          <span className="prazo vencendo">
            <strong>Prazo:</strong>{' '}
            <p>{format(parseISO(prazo_orig), 'dd/MM/YYY')}</p>
          </span>
        );
      }
      if (diferencaAtual / diferencaTotalDias > 0.8) {
        return (
          <span className="prazo vencendo">
            <strong>Prazo:</strong>{' '}
            <p>{format(parseISO(prazo_orig), 'dd/MM/YYY')}</p>
          </span>
        );
      }
      return (
        <span className="prazo normal">
          <strong>Prazo:</strong>{' '}
          <p>{format(parseISO(prazo_orig), 'dd/MM/YYY')}</p>
        </span>
      );
    }

    return (
      <span className="prazo normal">
        {getPrazoLabel(ticket)}
        <strong>Prazo:</strong> <p>Sem prazo definido</p>
      </span>
    );
  }

  function PrioridadeLabel() {
    switch (ticket.prioridade) {
      case 'B':
        return (
          <span className="prioridade baixa">
            <strong>Prioridade:</strong> <p>Baixa</p>
          </span>
        );
      case 'A':
        return (
          <span className="prioridade alta">
            <strong>Prioridade:</strong> <p>Alta</p>
          </span>
        );
      case 'U':
        return (
          <span className="prioridade urgente">
            <strong>Prioridade:</strong> <p>Urgente</p>
          </span>
        );
      default:
        return (
          <span className="prioridade normal">
            <strong>Prioridade:</strong> <p>Normal</p>
          </span>
        );
    }
  }

  function jsonToHtml(json) {
    const novoEditorState = EditorState.createWithContent(
      convertFromRaw(JSON.parse(json))
    );

    const NovocontentState = novoEditorState.getCurrentContent();
    return stateToHTML(NovocontentState);
  }

  function RetornaUpdate(update) {
    if (update) {
      let dados = update.texto;
      try {
        const { update_formatado } = update;
        const novoEditorState = EditorState.createWithContent(
          convertFromRaw(JSON.parse(update_formatado.texto_json))
        );

        const NovocontentState = novoEditorState.getCurrentContent();
        dados = stateToHTML(NovocontentState);
      } catch (err) {
        toast.error('Erro');
      }

      if (update.id_usuario === criador.id) {
        return (
          <>
            <div className="criador-update">
              <div className="info-criador">
                <div className="avatar">
                  {criador.avatar === null ||
                  typeof criador.avatar.url === 'undefined' ? (
                    Avatar(criador.nome, criador.sobrenome, 48)
                  ) : (
                    <img
                      src={criador.avatar.url}
                      alt={criador.nome}
                      className="avatar-img"
                    />
                  )}
                </div>
                <div className="user-info">
                  <p>{criador.nome}</p>
                  <span>{criador.cargo}</span>
                </div>
              </div>
              <div className="hora">
                <span>
                  {format(parseISO(update.createdAt), 'dd/MM/YYY HH:mm')}
                </span>
              </div>
            </div>
            <div className="conteudo-update">
              <div className="texto-update">{ReactHtmlParser(dados)}</div>
              {update.anexos_update.length > 0 && (
                <div className="anexos-update">
                  {update.anexos_update.map(an => (
                    <a href={an.url} key={an.id_anexo} className="anexo">
                      {IconeAnexo(an.nome)}
                      {an.nome}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      }
      if (update.id_usuario === destinatario.id) {
        return (
          <>
            <div className="conteudo-update">
              <div className="texto-update">{ReactHtmlParser(dados)}</div>
              {update.anexos_update.length > 0 && (
                <div className="anexos-update">
                  {update.anexos_update.map(an => (
                    <a href={an.url} key={an.id_anexo} className="anexo">
                      {IconeAnexo(an.nome)}
                      {an.nome}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="criador-update">
              <div className="info-criador">
                <div className="user-info right">
                  <p>{destinatario.nome}</p>
                  <span>{destinatario.cargo}</span>
                </div>
                <div className="avatar right">
                  {destinatario.avatar === null ||
                  typeof destinatario.avatar.url === 'undefined' ? (
                    Avatar(destinatario.nome, destinatario.sobrenome, 48)
                  ) : (
                    <img
                      src={destinatario.avatar.url}
                      alt={destinatario.nome}
                      className="avatar-img"
                    />
                  )}
                </div>
              </div>
              <div className="hora">
                <span>
                  {format(parseISO(update.createdAt), 'dd/MM/YYY HH:mm')}
                </span>
              </div>
            </div>
          </>
        );
      }
    }

    return '';
  }

  function closeModalEncerramento() {
    setTextoEncerramento('');
    setModalEncerramentoIsOpen(false);
  }

  async function handleEncerraTicket(e) {
    e.preventDefault();

    if (textoEncerramento.trim().length === 0) {
      toast.warn(
        'Você deve inserir uma mensagem para poder encerrar o ticket.'
      );
      return;
    }

    await api.post('tickets/encerramento', {
      id_ticket: ticket.id,
      texto: textoEncerramento,
    });

    const retorno = await api.get('tickets/inbox');
    setTickets_(retorno.data);
    setTickets(retorno.data);
    updateResumos(retorno.data);
    OrdenaTicket();
    setTicket({});
    setTextoEncerramento('');
    setModalEncerramentoIsOpen(false);
    setModalIsOpen(false);
    closeModal();
  }

  async function AdicionaAnexos(e) {
    if (e.target.files.length === 0) {
      return;
    }

    const file = new FormData();

    const re = /(?:\.([^.]+))?$/;
    const arquivo = e.target.files[e.target.files.length - 1];
    const tamanho = arquivo.size;
    const nome = arquivo.name;

    if (!ExtensaoValidaUpload(re.exec(nome)[1])) {
      toast.warn(
        'Este arquivo não é válido. Só são permitidos arquivos Word, Excel PowerPoint, Pdf e .txt.'
      );
      return;
    }

    file.append('file', arquivo, nome);

    const uploadAtual = {
      file,
      nome,
      tamanho,
      tamanhoFormatado: filesize(tamanho),
      progress: 0,
      uploaded: false,
      error: false,
      idupload: '',
      url: '',
    };

    if (file1.file === null) {
      const uploadFile1 = uploadAtual;

      setFile1(uploadAtual);
      api
        .post('upload', uploadFile1.file, {
          onUploadProgress: up => {
            const progress = parseInt(Math.round((up.loaded * 100) / up.total));
            setFile1({ ...uploadFile1, ...{ progress } });
          },
        })
        .then(response => {
          const { _id: idupload, url } = response.data;
          setFile1({ ...uploadFile1, ...{ uploaded: true, idupload, url } });
        })
        .catch(() => {
          uploadFile1.error = true;
          setFile2(uploadFile1);
        });
    } else if (file2.file === null) {
      const uploadFile2 = uploadAtual;

      setFile2(uploadAtual);
      api
        .post('upload', uploadFile2.file, {
          onUploadProgress: up => {
            const progress = parseInt(Math.round((up.loaded * 100) / up.total));
            setFile2({ ...uploadFile2, ...{ progress } });
          },
        })
        .then(response => {
          const { _id: idupload, url } = response.data;
          setFile2({ ...uploadFile2, ...{ uploaded: true, idupload, url } });
        })
        .catch(() => {
          uploadFile2.error = true;
          setFile2(uploadFile2);
        });
    } else if (file3.file === null) {
      const uploadFile3 = uploadAtual;

      setFile3(uploadAtual);
      api
        .post('upload', uploadFile3.file, {
          onUploadProgress: up => {
            const progress = parseInt(Math.round((up.loaded * 100) / up.total));
            setFile3({ ...uploadFile3, ...{ progress } });
          },
        })
        .then(response => {
          const { _id: idupload, url } = response.data;
          setFile3({ ...uploadFile3, ...{ uploaded: true, idupload, url } });
        })
        .catch(() => {
          uploadFile3.error = true;
          setFile3(uploadFile3);
        });
    } else {
      toast.warn(
        'Você já anexou o máximo de arquivos permitidos. Você pode remover os anexos atuais clicando no "x" sobre eles'
      );
    }
  }

  async function RemoveAnexo(anexo) {
    switch (anexo) {
      case 1:
        if (file1.idupload === '') {
          return;
        }

        const id1 = file1.idupload;
        api.delete(`upload/${id1}`);
        setFile1({
          file: null,
          nome: '',
          tamanho: 0,
          tamanhoFormatado: '',
          progress: 0,
          uploaded: false,
          error: false,
          idupload: '',
          url: '',
        });
        break;
      case 2:
        if (file2.idupload === '') {
          return;
        }
        const id2 = file2.idupload;
        api.delete(`upload/${id2}`);
        setFile2({
          file: null,
          nome: '',
          tamanho: 0,
          tamanhoFormatado: '',
          progress: 0,
          uploaded: false,
          error: false,
          idupload: '',
          url: '',
        });
        break;
      case 3:
        if (file3.idupload === '') {
          return;
        }
        const id3 = file3.idupload;
        api.delete(`upload/${id3}`);
        setFile3({
          file: null,
          nome: '',
          tamanho: 0,
          tamanhoFormatado: '',
          progress: 0,
          uploaded: false,
          error: false,
          idupload: '',
          url: '',
        });
        break;

      default:
        break;
    }
  }

  return (
    <>
      <Container>
        <Sidebar>
          <table className="side-table">
            <thead>
              <tr>
                <th>
                  <p>Categorias de tickets</p>
                  <FiFilter />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="botoes">
                  <div className="pai">
                    <button
                      type="button"
                      className="grupo-pai"
                      onClick={() => {
                        setTickets(tickets_);
                      }}
                    >
                      <p>Todas as categorias</p>
                      <span>{tickets_.length}</span>
                    </button>
                  </div>

                  {categorias
                    .sort((a, b) => (a.name > b.name ? 1 : -1))
                    .map(cat => (
                      <div className="grupo" key={cat.name}>
                        <button
                          type="button"
                          className="categoria"
                          data-nome={cat.name}
                          onClick={() => filterCategoria(cat.name)}
                        >
                          <p>{cat.name}</p>
                          <span>{cat.value}</span>
                        </button>

                        {subcategorias
                          .filter(
                            subc =>
                              subc.categoria === cat.name &&
                              subc.subcategoria !== ''
                          )
                          .sort((a, b) =>
                            a.subcategoria > b.subcategoria ? 1 : -1
                          )
                          .map(subcat => (
                            <button
                              onClick={() =>
                                filterSubcategoria(
                                  subcat.categoria,
                                  subcat.subcategoria
                                )
                              }
                              type="button"
                              className="subcategoria"
                              key={String(
                                `${subcat.categoria}-${subcat.subcategoria}`
                              )}
                            >
                              <p>{subcat.subcategoria}</p>
                              <span>{subcat.quant}</span>
                            </button>
                          ))}
                      </div>
                    ))}
                </td>
                <td className="footer">
                  <div className="vertical">
                    <FiInbox />
                    <p>{tickets_.length}</p>
                    <span>todos</span>
                  </div>
                  <div className="vertical">
                    <FiAlertCircle />
                    <p>{resumoDados.vencidos}</p>
                    <span>Vencidos</span>
                  </div>
                  <div className="vertical">
                    <FiClock />
                    <p>{resumoDados.prazo_curto}</p>
                    <span>Prazos curtos</span>
                  </div>
                  <div className="vertical">
                    <FiChevronsUp />
                    <p>{resumoDados.prioritario}</p>
                    <span>Prioritários</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </Sidebar>
        <Body>
          <table className="body-table">
            <thead>
              <tr>
                <th className="assunto">
                  <button
                    type="button"
                    onClick={() => {
                      if (colunaOrd === 'assunto') {
                        setColunaOrdAsc(!colunaOrdAsc);
                        OrdenaTicket(!colunaOrdAsc);
                      } else {
                        setColunaOrd('assunto');
                        setColunaOrdAsc(true);
                        OrdenaTicket(true);
                      }
                    }}
                    className={`titulo-coluna ${
                      colunaOrd === 'assunto' ? 'ativa' : ''
                    } ${colunaOrdAsc ? 'asc' : 'desc'}`}
                  >
                    ASSUNTO
                    {colunaOrd === 'assunto' &&
                      (colunaOrdAsc === true ? (
                        <AiOutlineSortAscending size={18} />
                      ) : (
                        <AiOutlineSortDescending size={18} />
                      ))}
                  </button>
                </th>
                <th className="propriedade">
                  <button
                    type="button"
                    onClick={() => {
                      if (colunaOrd === 'prioridade') {
                        setColunaOrdAsc(!colunaOrdAsc);
                        OrdenaTicket(!colunaOrdAsc);
                      } else {
                        setColunaOrd('prioridade');
                        setColunaOrdAsc(true);
                        OrdenaTicket(true);
                      }
                    }}
                    className={`titulo-coluna center ${
                      colunaOrd === 'prioridade' ? 'ativa' : ''
                    } ${colunaOrdAsc ? 'asc' : 'desc'}`}
                  >
                    PRIORIDADE
                    {colunaOrd === 'prioridade' &&
                      (colunaOrdAsc === true ? (
                        <AiOutlineSortAscending size={18} />
                      ) : (
                        <AiOutlineSortDescending size={18} />
                      ))}
                  </button>
                </th>
                <th className="status">
                  <button
                    type="button"
                    onClick={() => {
                      if (colunaOrd === 'status') {
                        setColunaOrdAsc(!colunaOrdAsc);
                        OrdenaTicket(!colunaOrdAsc);
                      } else {
                        setColunaOrd('status');
                        setColunaOrdAsc(true);
                        OrdenaTicket(true);
                      }
                    }}
                    className={`titulo-coluna center ${
                      colunaOrd === 'status' ? 'ativa' : ''
                    } ${colunaOrdAsc ? 'asc' : 'desc'}`}
                  >
                    STATUS
                    {colunaOrd === 'status' &&
                      (colunaOrdAsc === true ? (
                        <AiOutlineSortAscending size={18} />
                      ) : (
                        <AiOutlineSortDescending size={18} />
                      ))}
                  </button>
                </th>
                <th className="data">
                  <button
                    type="button"
                    onClick={() => {
                      if (colunaOrd === 'data') {
                        setColunaOrdAsc(!colunaOrdAsc);
                        OrdenaTicket(!colunaOrdAsc);
                      } else {
                        setColunaOrd('data');
                        setColunaOrdAsc(true);
                        OrdenaTicket(true);
                      }
                    }}
                    className={`titulo-coluna center ${
                      colunaOrd === 'data' ? 'ativa' : ''
                    } ${colunaOrdAsc ? 'asc' : 'desc'}`}
                  >
                    DATA
                    {colunaOrd === 'data' &&
                      (colunaOrdAsc === true ? (
                        <AiOutlineSortAscending size={18} />
                      ) : (
                        <AiOutlineSortDescending size={18} />
                      ))}
                  </button>
                </th>
                <th className="prazo">
                  <button
                    type="button"
                    onClick={() => {
                      if (colunaOrd === 'prazo') {
                        setColunaOrdAsc(!colunaOrdAsc);
                        OrdenaTicket(!colunaOrdAsc);
                      } else {
                        setColunaOrd('prazo');
                        setColunaOrdAsc(true);
                        OrdenaTicket(true);
                      }
                    }}
                    className={`titulo-coluna center ${
                      colunaOrd === 'prazo' ? 'ativa' : ''
                    } ${colunaOrdAsc ? 'asc' : 'desc'}`}
                  >
                    PRAZO
                    {colunaOrd === 'prazo' &&
                      (colunaOrdAsc === true ? (
                        <AiOutlineSortAscending size={18} />
                      ) : (
                        <AiOutlineSortDescending size={18} />
                      ))}
                  </button>
                </th>
                <th className="atualizado">
                  <button
                    type="button"
                    onClick={() => {
                      if (colunaOrd === 'atualizado') {
                        setColunaOrdAsc(!colunaOrdAsc);
                        OrdenaTicket(!colunaOrdAsc);
                      } else {
                        setColunaOrd('atualizado');
                        setColunaOrdAsc(true);
                        OrdenaTicket(true);
                      }
                    }}
                    className={`titulo-coluna center ${
                      colunaOrd === 'atualizado' ? 'ativa' : ''
                    } ${colunaOrdAsc ? 'asc' : 'desc'}`}
                  >
                    ATUALIZADO
                    {colunaOrd === 'atualizado' &&
                      (colunaOrdAsc === true ? (
                        <AiOutlineSortAscending size={18} />
                      ) : (
                        <AiOutlineSortDescending size={18} />
                      ))}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {tickets.map(t => (
                <tr
                  key={String(t.id)}
                  onClick={() => {
                    CarregarTicket(t.id);
                  }}
                >
                  <td className="assunto">
                    <div className="conteiner">
                      <div className="info">
                        <strong>
                          {t.anexos.length > 0 && <MdAttachFile />}
                          {t.assunto}
                        </strong>
                        <span>
                          <FiUser size={10} />
                          {t.criador.nome}
                          <FiFolder size={10} />
                          {t.categoria}
                          {t.subcategoria !== '' ? ' - ' : ''}
                          {t.subcategoria}
                        </span>
                      </div>
                      <div className="id">
                        {getTipoLabel(t)}

                        <span># {t.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="prioridade">
                    {getPrioridadeLabel(t.prioridade)}
                  </td>
                  <td className="status">{getStatusLabel(t)}</td>
                  <td className="data">
                    {format(parseISO(t.createdAt), 'dd/MM/YYY HH:mm')}
                  </td>
                  <td className="prazo">{getPrazoLabel(t)}</td>
                  <td className="atualizado">{getAtualizado(t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Body>
      </Container>
      <Modal
        ariaHideApp={false}
        isOpen={modalIsOpen}
        shouldCloseOnOverlayClick={false}
        onAfterOpen={afterOpenModal}
        onAfterClose={closeModal}
        style={estiloModalTicket}
        contentLabel="Example Modal"
      >
        {ticket && ticket.id > 0 && (
          <div className="modal-ticket">
            <div className="titulo-ticket">
              <h1>{ticket.assunto}</h1>
              <button
                type="button"
                onClick={() => {
                  setTicket({});
                  setModalIsOpen(false);
                }}
              >
                <MdClose color="#666" />{' '}
              </button>
            </div>

            <div className="conteudo">
              <div className="cabecalho-ticket">
                <div className="criador">
                  <div className="avatar">
                    {ticket.criador.avatar === null ||
                    typeof ticket.criador.avatar.url === 'undefined' ? (
                      Avatar(ticket.criador.nome, ticket.criador.sobrenome, 48)
                    ) : (
                      <img
                        className="avatar-img"
                        src={ticket.criador.avatar.url}
                        alt={ticket.criador.nome}
                      />
                    )}
                  </div>

                  <div className="user-info">
                    <p>{ticket.criador.nome}</p>
                    <span>{ticket.criador.cargo}</span>
                  </div>
                </div>
                <div className="info-ticket">
                  <div className="prazo-prioridade">
                    {PrazoLabel()}
                    {PrioridadeLabel()}
                  </div>
                  <div className="tempo">
                    {formatDistance(parseISO(ticket.createdAt), new Date(), {
                      addSuffix: true,
                      locale: pt,
                    })}
                  </div>
                </div>
                <div className="categorizacao">
                  <MdLabelOutline />
                  {ticket.categoria}
                  {ticket.subcategoria && ` - ${ticket.subcategoria}`}
                </div>

                <div className="anexos">
                  {ticket.anexos.map(anexo => (
                    <a
                      key={anexo.id_anexo}
                      href={anexo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="icone">{IconeAnexo(anexo.nome)}</div>
                      <div className="info">
                        <p>{anexo.nome}</p>
                        <span>{filesize(anexo.size)}</span>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="ticket-body">
                  {ticket.formatado &&
                    ReactHtmlParser(jsonToHtml(ticket.formatado.texto_json))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalEncerramentoIsOpen(true);
                  }}
                  className="encerrar-ticket btn-red"
                >
                  Encerrar ticket
                </button>
                <div className="updates">
                  <div className="ordenacao">
                    {ordemDesc && (
                      <>
                        <button type="button" onClick={AlternaOrdem}>
                          <MdExpandLess />
                        </button>
                        <p>
                          Exibindo mais <strong>recentes</strong> primeiro
                        </p>
                      </>
                    )}
                    {!ordemDesc && (
                      <>
                        <button type="button" onClick={AlternaOrdem}>
                          <MdExpandMore />
                        </button>
                        <p>
                          Exibindo mais <strong>antigos</strong> primeiro
                        </p>
                      </>
                    )}
                  </div>

                  {ticket.updates.map(u => (
                    <div className="update" key={String(u.id)}>
                      {RetornaUpdate(u)}
                    </div>
                  ))}

                  <div className="editorContainer">
                    <div className="buttons">
                      <button
                        type="button"
                        onClick={onBoldClick}
                        title="Negrito (Ctrl+B)"
                      >
                        <b>
                          <img src={Negrito} alt="" />
                        </b>
                      </button>
                      <button
                        type="button"
                        onClick={onItalicClick}
                        title="Itálico (Ctrl+I)"
                      >
                        <em>
                          <img src={Italico} alt="" />
                        </em>
                      </button>
                      <button
                        type="button"
                        onClick={onUnderlineClick}
                        title="Sublinhado (Ctrl+S)"
                      >
                        <img src={Sublinhado} alt="" />
                      </button>
                    </div>{' '}
                    <div className="editors">
                      <Editor
                        editorState={estado}
                        handleKeyCommand={handleKeyCommand}
                        onChange={onChange}
                        handleBeforeInput={handleBeforeChange}
                        handlePastedText={_handlePastedText}
                      />
                    </div>
                  </div>
                  <div className="update-footer">
                    <span>{toggleLimit()}</span>
                    <form onSubmit={HandleUpdate}>
                      <div className="uploads">
                        <label htmlFor="upload">
                          <MdCloudUpload />{' '}
                          <div>
                            <strong>Upload</strong>{' '}
                            <span>(Máx. 3 arquiv.)</span>
                          </div>
                          <input
                            onChange={AdicionaAnexos}
                            type="file"
                            id="upload"
                            accept={extensoesValidas}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <div className="files">
                          {file1.file && (
                            <div className="file">
                              {IconeAnexo(file1.nome)}
                              <div>
                                <span>{file1.tamanhoFormatado}</span>
                                <p>{file1.nome}</p>
                              </div>
                              {file1.uploaded && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    RemoveAnexo(1);
                                  }}
                                >
                                  <MdClear />
                                </button>
                              )}

                              <div className="icone">
                                {!file1.uploaded && !file1.error && (
                                  <CircularProgressbar
                                    styles={{
                                      root: { width: 32, height: 32 },
                                      path: {
                                        stroke: '#666',
                                        transformOrigin: 'center center',
                                      },
                                    }}
                                    strokeWidth={10}
                                    value={file1.progress}
                                  />
                                )}
                                {file1.uploaded && (
                                  <MdCheckCircle size={24} color="#2ecc71" />
                                )}
                                {file1.error && (
                                  <MdError size={24} color="#e57878" />
                                )}
                              </div>
                            </div>
                          )}
                          {file2.file && (
                            <div className="file">
                              {IconeAnexo(file2.nome)}
                              <div>
                                <span>{file2.tamanhoFormatado}</span>
                                <p>{file2.nome}</p>
                              </div>

                              {file2.uploaded && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    RemoveAnexo(2);
                                  }}
                                >
                                  <MdClear />
                                </button>
                              )}

                              <div className="icone">
                                {!file2.uploaded && !file2.error && (
                                  <CircularProgressbar
                                    styles={{
                                      root: { width: 32, height: 32 },
                                      path: {
                                        stroke: '#666',
                                        transformOrigin: 'center center',
                                      },
                                    }}
                                    strokeWidth={10}
                                    value={file2.progress}
                                  />
                                )}
                                {file2.uploaded && (
                                  <MdCheckCircle size={24} color="#2ecc71" />
                                )}
                                {file2.error && (
                                  <MdError size={24} color="#e57878" />
                                )}
                              </div>
                            </div>
                          )}

                          {file3.file && (
                            <div className="file">
                              {IconeAnexo(file3.nome)}
                              <div>
                                <span>{file3.tamanhoFormatado}</span>
                                <p>{file3.nome}</p>
                              </div>

                              {file3.uploaded && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    RemoveAnexo(3);
                                  }}
                                >
                                  <MdClear />
                                </button>
                              )}

                              <div className="icone">
                                {!file3.uploaded && !file3.error && (
                                  <CircularProgressbar
                                    styles={{
                                      root: { width: 32, height: 32 },
                                      path: {
                                        stroke: '#666',
                                        transformOrigin: 'center center',
                                      },
                                    }}
                                    strokeWidth={10}
                                    value={file3.progress}
                                  />
                                )}
                                {file3.uploaded && (
                                  <MdCheckCircle size={24} color="#2ecc71" />
                                )}
                                {file3.error && (
                                  <MdError size={24} color="#e57878" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="botoes">
                        <button
                          type="button"
                          className="cancel btn-white"
                          onClick={closeModal}
                        >
                          Cancelar
                        </button>
                        {criandoUpdate ? (
                          <button
                            type="button"
                            className="send btn-green loading"
                          >
                            <AiOutlineLoading3Quarters
                              className="rotating"
                              color="#fff"
                            />
                            Enviando
                          </button>
                        ) : (
                          <button type="submit" className="send btn-green">
                            Enviar
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        ariaHideApp={false}
        isOpen={modalEncerramentoIsOpen}
        onAfterOpen={() => {}}
        shouldCloseOnOverlayClick
        onAfterClose={closeModalEncerramento}
        onRequestClose={closeModalEncerramento}
        style={estiloModalEncerramento}
        contentLabel="Example Modal"
        overlayClassName="overlay"
      >
        <div className="modal">
          <div className="titulo-modal">
            <h1>Solicitar encerramento do ticket</h1>
          </div>
          <div className="corpo-modal">
            <p>
              Solicite o encerramento deste ticket enviando uma mensagem para
              seu remetente. Descreva a solução ou informe o motivo do
              encerramento.
            </p>
          </div>
          <form onSubmit={handleEncerraTicket}>
            <textarea
              placeholder="Motivo do encerramento"
              maxLength="250"
              onChange={e => {
                setTextoEncerramento(e.target.value);
              }}
              value={textoEncerramento}
            />

            <div className="modal-footer">
              <button
                type="button"
                className="btn-white"
                onClick={() => {
                  closeModalEncerramento();
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-green">
                Enviar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
