// src/utils/avatars.js
// Array de avatares predeterminados de Cloudinary
const DEFAULT_AVATARS = [
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369015/pulse/avatar_nsx2kr.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369014/pulse/asesino_d4wbmj.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369013/pulse/hacker_inmsjy.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369013/pulse/gatito_klen29.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369012/pulse/gato_lyyhfg.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369012/pulse/frankenstein_wvchgz.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369012/pulse/dracula_cltxmb.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369012/pulse/conejito_brztid.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744369012/pulse/avatar1_qlx3ex.png',
  'https://res.cloudinary.com/dafjggs2p/image/upload/v1744368979/pulse/caperucita-roja_quczln.png'
];

// Función para obtener un avatar aleatorio
const getRandomAvatar = () => {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
};

module.exports = {
  DEFAULT_AVATARS,
  getRandomAvatar
}; 