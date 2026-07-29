import Layout from "@/components/Layout"
import Link from "next/link"
import { ArrowLeft } from "@/lib/icons"

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <h1 className="text-4xl font-serif font-bold text-text-primary mb-3">
          Privacidade
        </h1>
        <p className="text-text-secondary mb-10">
          Página provisória. O texto definitivo desta política ainda será definido.
        </p>

        <div className="space-y-6 text-text-secondary leading-relaxed">
          <p>
            O Librian trata dados necessários para autenticação e para o gerenciamento
            da sua biblioteca pessoal (como e-mail, nome e livros cadastrados).
          </p>
          <p>
            Em breve publicaremos aqui detalhes sobre coleta, uso, armazenamento e
            seus direitos em relação aos dados.
          </p>
          <p className="text-sm text-text-muted">
            Conteúdo placeholder — atualize quando a política oficial estiver pronta.
          </p>
        </div>
      </div>
    </Layout>
  )
}
