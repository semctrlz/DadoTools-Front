/* eslint-disable spaced-comment */
import React from 'react';
import {
  AiFillFileImage,
  AiFillFileExcel,
  AiFillFilePdf,
  AiFillFilePpt,
  AiFillFileWord,
  AiFillFileText,
} from 'react-icons/ai';

export const extensoesValidas = [
  'jpg', //Imagem jpg
  'jpeg', //Imagem jpg
  'png', //Imagem jpg
  'bpm', //Imagem Bitmap
  'xls', //Formato antigo
  'xlsx', //Formato novo
  'xlsm', //Pasta de trabalho habilitada para macro
  'xltx', //Modelo
  'xltm', //Hodelo habilitado para macro
  'xlsb', //Pasta de trabalho binária não XML
  'xlam', //Complemento ativado para macros
  'doc', //Formato antigo
  'docx', //Formato novo
  'docm', //Documento habilitado para macro
  'dotx', //Modelo
  'dotm', //Modelo habilitado para macro
  'txt', //Texto bloco de notas
  'pdf', //Pdf
  'ppt', //Modelo antigo
  'pptx', //Modelo novo
  'pptm', //Apresentação habilitada para macro
  'potx', //Modelo
  'potm', //Modelo Habilitado para macro
  'ppam', //Suplemento Habilitado para macro
  'ppsx', //Apresentação de slides
  'ppsm', //Apresentação de slides habilitada para macro
  'sldx', //Slide
  'sldm', //Slide habilitado para macro
];

export function FormataFileSize(bytes, si) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
}
export function ExtensaoValidaUpload(ext) {
  return extensoesValidas.includes(ext);
}

export function RetornaExtensaoDoNome(nome) {
  const re = /(?:\.([^.]+))?$/;

  return re.exec(nome)[1];
}

export function RetornaIconeDaExtensao(ext) {
  const extFormatada = String(ext).replace('.', '').trim().toLowerCase();
  if (ExtensaoValidaUpload(extFormatada)) {
    switch (extFormatada) {
      case 'jpg': //Imagem jpg
      case 'jpeg': //Imagem jpg
      case 'png': //Imagem jpg
      case 'bpm': //Imagem Bitmap':
        return <AiFillFileImage className="icone" />;
      case 'xls': //Formato antigo
      case 'xlsx': //Formato novo
      case 'xlsm': //Pasta de trabalho habilitada para macro
      case 'xltx': //Modelo
      case 'xltm': //Hodelo habilitado para macro
      case 'xlsb': //Pasta de trabalho binária não XML
      case 'xlam': //Complemento ativado para macros
        return <AiFillFileExcel className="icone" />;
      case 'doc': //Formato antigo
      case 'docx': //Formato novo
      case 'docm': //Documento habilitado para macro
      case 'dotx': //Modelo
      case 'dotm': //Modelo habilitado para macro
        return <AiFillFileWord className="icone" />;
      case 'txt': //Texto bloco de notas
        return <AiFillFileText className="icone" />;
      case 'pdf': //Pdf
        return <AiFillFilePdf className="icone" />;
      case 'ppt': //Modelo antigo
      case 'pptx': //Modelo novo
      case 'pptm': //Apresentação habilitada para macro
      case 'potx': //Modelo
      case 'potm': //Modelo Habilitado para macro
      case 'ppam': //Suplemento Habilitado para macro
      case 'ppsx': //Apresentação de slides
      case 'ppsm': //Apresentação de slides habilitada para macro
      case 'sldx': //Slide
      case 'sldm': //Slide habilitado para macro
        return <AiFillFilePpt className="icone" />;
      default:
        return '';
    }
  } else {
    return '';
  }
}