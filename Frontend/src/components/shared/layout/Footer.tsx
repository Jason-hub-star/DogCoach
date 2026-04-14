type FooterLinkItem = { label: string; href: string };

const serviceLinks: FooterLinkItem[] = [
    { label: "서비스 소개", href: "/#service-intro" },
    { label: "요금제", href: "/#pricing" },
];

const supportLinks: FooterLinkItem[] = [
    { label: "자주 묻는 질문", href: "/#faq" },
    { label: "1:1 문의", href: "mailto:gmdqn2tp@gmail.com" },
];

const legalLinks: FooterLinkItem[] = [
    { label: "개인정보 처리방침", href: "/privacy" },
    { label: "이용약관", href: "/terms" },
];

export function Footer() {
    return (
        <footer className="bg-slate-800 pt-20 pb-10 text-gray-300">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6 cursor-default">
                            <div className="w-8 h-8 rounded-lg bg-brand-lime flex items-center justify-center">
                                <span className="text-white font-bold">TL</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight font-outfit">TailLog</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-sm break-keep leading-relaxed text-sm">
                            TailLog는 데이터로 반려견 행동 패턴을 이해하고, 보호자가 더 빠르게
                            맞춤 훈련 루틴을 실행할 수 있도록 돕는 서비스입니다.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm">서비스</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {serviceLinks.map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} className="hover:text-brand-lime transition-colors">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm">고객지원</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {supportLinks.map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} className="hover:text-brand-lime transition-colors">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm">법적 고지</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {legalLinks.map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} className="hover:text-brand-lime transition-colors">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-xs font-mono tracking-tighter">
                        © 2026 TailLog AI Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
