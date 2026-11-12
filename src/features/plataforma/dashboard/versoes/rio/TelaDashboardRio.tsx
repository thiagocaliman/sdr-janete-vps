import { TelaDashboardFinal, type PropsTelaDashboardFinal } from "../final/TelaDashboardFinal";
import { Rio } from "./Rio";

// A versão "rio" do Dashboard (a direção de movimento aprovada em 10/11/2026): a mesma página da
// versão final (cabeçalho, cartões, capítulos de cada etapa, resultado do período), com o rio de
// leads no lugar do desenho do funil. Sem o palco da rolagem: o cartão do rio fica no fluxo, a faixa
// das etapas presa logo abaixo e os capítulos em sequência.
//
// Para voltar à versão final, basta trocar o import em `TelaDashboard.tsx`.

const desenho: NonNullable<PropsTelaDashboardFinal["desenho"]> = (props) => <Rio {...props} />;

export function TelaDashboardRio() {
  return <TelaDashboardFinal versao="rio" desenho={desenho} />;
}
