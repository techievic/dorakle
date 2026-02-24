export interface OracleResult {
  is_valid: boolean;
  error_message?: string;
  coin: string;
  ticker: string;
  verdict: string;
  traits: string[];
  uncomfortable_truth: string;
}

export interface CoinTheme {
  color: string;
  emoji: string;
}

export const COIN_THEMES: Record<string, CoinTheme> = {
  bitcoin: { color: '#F7931A', emoji: '₿' },
  ethereum: { color: '#627EEA', emoji: '⟠' },
  solana: { color: '#9945FF', emoji: '◎' },
  dogecoin: { color: '#C3A634', emoji: '🐕' },
  xrp: { color: '#00AAE4', emoji: '✕' },
  cardano: { color: '#0033AD', emoji: '₳' },
  chainlink: { color: '#375BD2', emoji: '⬡' },
  monero: { color: '#FF6600', emoji: 'ɱ' },
  pepe: { color: '#3DFFC0', emoji: '🐸' },
  avalanche: { color: '#E84142', emoji: '🔺' },
  uniswap: { color: '#FF007A', emoji: '🦄' },
  aave: { color: '#B6509E', emoji: '👻' },
  polkadot: { color: '#E6007A', emoji: '●' },
  shiba: { color: '#FFA500', emoji: '🐕' },
  arbitrum: { color: '#28A0F0', emoji: '💙' },
  optimism: { color: '#FF0420', emoji: '🔴' },
  near: { color: '#000000', emoji: 'Ⓝ' },
  fantom: { color: '#1969FF', emoji: '👻' },
  injective: { color: '#00A3FF', emoji: '🥷' },
  sui: { color: '#4DA2FF', emoji: '💧' },
  aptos: { color: '#2DD4BF', emoji: 'A' },
  maker: { color: '#1AAB9B', emoji: 'M' },
  compound: { color: '#00D395', emoji: 'C' },
  curve: { color: '#0000FF', emoji: '🌈' },
  lido: { color: '#00A3FF', emoji: '🏝️' },
};

export const DEFAULT_THEME: CoinTheme = {
  color: '#F7931A',
  emoji: '✨',
};
