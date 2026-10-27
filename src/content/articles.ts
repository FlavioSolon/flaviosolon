export type Article = {
  slug: string
  title: string
  description: string
  category: string
  date: string
  readingTime: string
  sections: {
    title: string
    paragraphs: string[]
  }[]
}

// Conteúdo editorial inicial: revisar antes de publicar no domínio.
export const articles: Article[] = [
  {
    slug: "software-resiliente-conexoes-instaveis",
    title: "Software resiliente começa pela conexão mais frágil",
    description:
      "Como pensar interfaces, sincronização e tolerância a falhas para pessoas que não têm uma conexão estável.",
    category: "ENGENHARIA & IMPACTO",
    date: "2026-02-12",
    readingTime: "3 min",
    sections: [
      {
        title: "O que é software resiliente?",
        paragraphs: [
          "Software resiliente continua oferecendo uma experiência útil quando a rede falha, o dispositivo tem poucos recursos ou um serviço fica indisponível. Não significa que toda funcionalidade opera offline, mas que os limites ficam claros e o trabalho do usuário é preservado.",
          "Projetar para a conexão mais frágil muda a pergunta: em vez de “como tornar esta tela mais sofisticada?”, perguntamos “o que precisa continuar funcionando para esta pessoa?”.",
        ],
      },
      {
        title: "Comece pelo essencial",
        paragraphs: [
          "O conteúdo principal deve aparecer antes de recursos secundários. Imagens dimensionadas, carregamento tardio do que está fora da tela e dependências pequenas reduzem o custo de acesso. Medir em um dispositivo real e em uma rede limitada é mais útil do que confiar apenas na velocidade do computador de desenvolvimento.",
          "Em formulários, preserve o texto quando ocorrer uma falha. Informe o estado do envio e ofereça uma tentativa explícita. Nunca anuncie sucesso antes de receber a confirmação necessária.",
        ],
      },
      {
        title: "Sincronização sem surpresas",
        paragraphs: [
          "Uma fila local pode ajudar quando o produto realmente precisa operar offline. Essa decisão exige regras para conflitos, expiração e proteção dos dados. Pagamentos e ações irreversíveis merecem confirmação do servidor e chaves de idempotência para evitar duplicidade.",
          "Retentativas devem ter limite e espaçamento progressivo. O usuário precisa entender o que está pendente, o que foi confirmado e o que depende de sua intervenção.",
        ],
      },
      {
        title: "Uma lista de verificação prática",
        paragraphs: [
          "Teste a perda de conexão durante uma ação, não apenas antes de abrir a página. Verifique se há feedback compreensível, se o trabalho foi preservado e se tentar novamente não duplica o resultado.",
          "Resiliência é uma escolha de arquitetura e de experiência. O objetivo é entregar o essencial com honestidade, inclusive quando as condições não são ideais.",
        ],
      },
    ],
  },
  {
    slug: "rust-laravel-escolha-arquitetura",
    title: "Rust ou Laravel? Primeiro, entenda o problema",
    description:
      "Uma abordagem prática para escolher entre produtividade de negócio, segurança de memória e necessidades de concorrência.",
    category: "ARQUITETURA DE SOFTWARE",
    date: "2026-02-10",
    readingTime: "3 min",
    sections: [
      {
        title: "Não existe uma stack universal",
        paragraphs: [
          "A escolha de tecnologia deve considerar regras de negócio, experiência da equipe, custo de operação e requisitos mensuráveis. Rust e Laravel resolvem problemas diferentes e também podem coexistir.",
          "Comece registrando os limites: volume de requisições esperado, tempo de resposta aceitável, infraestrutura disponível e frequência de mudança das regras. Sem esses dados, a discussão tende a virar preferência pessoal.",
        ],
      },
      {
        title: "Onde Laravel faz sentido",
        paragraphs: [
          "Laravel oferece ferramentas integradas para roteamento, validação, autenticação, filas e persistência. É uma opção para produtos com muitas regras de negócio e equipes que precisam evoluir funcionalidades com um ecossistema consistente.",
          "A performance depende da aplicação: consultas, índices, cache, filas e desenho das integrações frequentemente importam mais do que trocar de linguagem. Meça o gargalo antes de propor uma reescrita.",
        ],
      },
      {
        title: "Onde Rust faz sentido",
        paragraphs: [
          "Rust oferece controle sobre recursos e segurança de memória no código seguro, com verificação de propriedade e empréstimos. Pode ser uma boa opção para componentes sensíveis a latência, processamento concorrente ou integração com sistemas.",
          "Isso não elimina bugs, vazamentos lógicos de recursos ou a necessidade de observabilidade. A equipe precisa considerar a curva de aprendizado e o custo de manutenção.",
        ],
      },
      {
        title: "Como combinar sem criar complexidade desnecessária",
        paragraphs: [
          "Mantenha fronteiras explícitas, contratos de API versionados e observabilidade das chamadas. Extraia um serviço apenas quando houver um motivo concreto, como isolamento de carga ou um perfil de processamento diferente.",
          "A arquitetura mais sólida é a menor que atende aos requisitos atuais e permite evoluir com evidência. Um monólito bem estruturado pode ser melhor do que vários serviços sem necessidade.",
        ],
      },
    ],
  },
]
