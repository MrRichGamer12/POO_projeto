

export default class MotivationModel {

    constructor(data = {}) {
        this.quotes = Array.isArray(data.quotes) ? data.quotes : [];
        this.links = Array.isArray(data.links) ? data.links : [];
        this.tips = Array.isArray(data.tips) ? data.tips : [];
    }

    
    static getFallbackData() {
        return {
            quotes: [
                { id: "quote-001", text: "Um passo pequeno ainda é progresso.", category: "Progresso" },
                { id: "quote-002", text: "Começa pelo que é possível agora, não pelo plano perfeito.", category: "Foco" },
                { id: "quote-003", text: "Dividir uma tarefa grande torna o primeiro passo mais leve.", category: "Organização" },
                { id: "quote-004", text: "Constância não é fazer tudo. É voltar ao caminho quando te distrais.", category: "Constância" },
                { id: "quote-005", text: "Uma pausa consciente também faz parte do foco.", category: "Autocuidado" },
                { id: "quote-006", text: "Escolhe uma prioridade principal e dá-lhe alguns minutos de atenção real.", category: "Estudo" },
                { id: "quote-007", text: "Não precisas resolver o dia inteiro agora. Resolve o próximo passo.", category: "Procrastinação" },
                { id: "quote-008", text: "Organização é uma ferramenta de apoio, não uma cobrança perfeita.", category: "Rotina" }
            ],
            links: [
                {
                    id: "link-001",
                    title: "CDC - Informação geral sobre ADHD/TDAH",
                    description: "Página com informação geral sobre sintomas, diagnóstico, tratamento e recursos educativos.",
                    category: "TDAH e atenção",
                    type: "Organização de saúde",
                    url: "https://www.cdc.gov/adhd/index.html"
                },
                {
                    id: "link-002",
                    title: "NHS - ADHD em adultos",
                    description: "Informação pública sobre TDAH em adultos, gestão diária e apoio profissional.",
                    category: "TDAH e atenção",
                    type: "Organização de saúde",
                    url: "https://www.nhs.uk/conditions/adhd-adults/"
                },
                {
                    id: "link-003",
                    title: "NHS - ADHD em crianças e jovens",
                    description: "Recurso informativo sobre TDAH em crianças e jovens, com orientações gerais de apoio.",
                    category: "TDAH e atenção",
                    type: "Organização de saúde",
                    url: "https://www.nhs.uk/conditions/adhd-children-teenagers/"
                },
                {
                    id: "link-004",
                    title: "CHADD - Recursos para adultos com ADHD",
                    description: "Organização especializada com recursos educativos, webinars e apoio comunitário.",
                    category: "Hábitos e rotina",
                    type: "Organização especializada",
                    url: "https://chadd.org/education/adults/"
                },
                {
                    id: "link-005",
                    title: "CHADD - Estratégias de organização e gestão do tempo",
                    description: "Webinar educativo sobre organização, tarefas e gestão do tempo para jovens com ADHD.",
                    category: "Técnicas de foco",
                    type: "Vídeo educativo",
                    url: "https://chadd.org/webinars/homework-organization-and-time-management-strategies-to-help-kids-with-adhd/"
                },
                {
                    id: "link-006",
                    title: "CHADD/UMD ADHD Tools",
                    description: "Conjunto de vídeos e ferramentas educativas pensadas para adolescentes e jovens adultos com ADHD.",
                    category: "Vídeos educativos",
                    type: "Vídeo educativo",
                    url: "https://chadd.org/stroud-umdadhdtools/"
                }
            ],
            tips: [
                { id: "tip-001", title: "Divide para começar", description: "Transforma uma tarefa grande em três ações pequenas e escolhe só a primeira." },
                { id: "tip-002", title: "Usa sessões curtas", description: "Começa com 10 ou 15 minutos de foco antes de tentar uma sessão longa." },
                { id: "tip-003", title: "Define uma prioridade", description: "Escolhe uma prioridade principal para o dia e deixa o resto como apoio." },
                { id: "tip-004", title: "Prepara o ambiente", description: "Remove uma distração visível antes de começar a estudar ou trabalhar." },
                { id: "tip-005", title: "Faz pausas reais", description: "Durante a pausa, levanta-te, bebe água ou respira alguns minutos sem trocar uma distração por outra." },
                { id: "tip-006", title: "Planeia antes de executar", description: "Antes de começar, escreve o que vais fazer, quanto tempo vais tentar e qual é o próximo passo." }
            ]
        };
    }

    static fromSources({ quotes = [], links = [], tips = [] } = {}) {
        const fallback = this.getFallbackData();

        return new MotivationModel({
            quotes: Array.isArray(quotes) && quotes.length > 0 ? quotes : fallback.quotes,
            links: Array.isArray(links) && links.length > 0 ? links : fallback.links,
            tips: Array.isArray(tips) && tips.length > 0 ? tips : fallback.tips
        });
    }

    
    getDailyQuote(date = new Date()) {
        if (this.quotes.length === 0) {
            return null;
        }

        const dateKey = date.toISOString().slice(0, 10).replace(/-/g, "");
        const index = Number(dateKey) % this.quotes.length;
        return this.quotes[index];
    }

    getRandomQuote() {
        if (this.quotes.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * this.quotes.length);
        return this.quotes[index];
    }

    getLinksByCategory() {
        return this.links.reduce((grouped, link) => {
            const category = link.category || "Outros";
            grouped[category] = grouped[category] || [];
            grouped[category].push(link);
            return grouped;
        }, {});
    }
}
