import Link from "next/link"
import { BrandIcon, AwkwardSmileIcon, GithubIcon, MailIcon } from "@/lib/icons"

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-border-subtle bg-gradient-to-br from-surface to-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg">
                <BrandIcon className="w-5 h-5 text-[#1a1208]" strokeWidth={2.25} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-accent">
                  Librian
                </h3>
                <p className="text-sm text-text-secondary">Sua biblioteca pessoal</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-md">
              Organize seu acervo físico, acompanhe leituras e compartilhe seus gostos literários.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-text-secondary hover:text-accent transition-all duration-200 hover:bg-accent-light/10 rounded-xl hover:scale-105"
                aria-label="GitHub"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a
                href="mailto:contato@librian.io"
                className="p-2 text-text-secondary hover:text-accent transition-all duration-200 hover:bg-accent-light/10 rounded-xl hover:scale-105"
                aria-label="Email"
              >
                <MailIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-text-primary mb-4">Navegação</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-text-secondary hover:text-accent transition-colors duration-200">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/shelf" className="text-sm text-text-secondary hover:text-accent transition-colors duration-200">
                  Estante
                </Link>
              </li>
              <li>
                <Link href="/books/new" className="text-sm text-text-secondary hover:text-accent transition-colors duration-200">
                  Adicionar Livro
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-text-secondary hover:text-accent transition-colors duration-200">
                  Perfil
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-text-primary mb-4">Recursos</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-text-secondary">Organização por status</span></li>
              <li><span className="text-sm text-text-secondary">Acompanhamento de progresso</span></li>
              <li><span className="text-sm text-text-secondary">Avaliações e anotações</span></li>
              <li><span className="text-sm text-text-secondary">Magic link + senha</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <AwkwardSmileIcon className="w-4 h-4 text-accent" />
            <span>A vida é difícil, mas é mais difícil quando você é burro</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <span>© 2026 Librian</span>
            <Link href="/privacy" className="hover:text-accent transition-colors duration-200">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-accent transition-colors duration-200">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
