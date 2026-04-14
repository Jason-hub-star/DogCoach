export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-10 md:py-12 px-4 sm:px-5">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 sm:p-8 md:p-12">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-8 break-keep text-balance-kr">서비스 이용약관</h1>

                <div className="space-y-8 text-gray-700 legal-copy-mobile break-keep text-pretty-kr">
                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 1 조 (목적)</h2>
                        <p>
                            본 약관은 TailLog(이하 "회사")가 제공하는 반려견 행동 기록 및 AI 코칭 서비스(이하 "서비스")의 이용과 관련하여
                            회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 2 조 (정의)</h2>
                        <ul className="list-decimal list-outside space-y-2 pl-5">
                            <li>"서비스"란 회사가 제공하는 반려견 행동 기록, 분석, AI 코칭 등의 모든 서비스를 의미합니다.</li>
                            <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                            <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디(ID)를 부여받은 이용자를 말합니다.</li>
                            <li>"비회원"이란 회원가입 없이 게스트로 서비스를 이용하는 자를 말합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 3 조 (약관의 게시와 개정)</h2>
                        <p className="mb-4">
                            ① 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
                        </p>
                        <p>
                            ② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
                            개정된 약관은 시행일 7일 전부터 공지하며, 중대한 변경사항의 경우 30일 전에 공지합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 4 조 (서비스의 제공 및 변경)</h2>
                        <p className="mb-4">
                            ① 회사는 다음과 같은 서비스를 제공합니다:
                        </p>
                        <ul className="list-disc list-outside space-y-2 pl-5 mb-4">
                            <li>반려견 행동 기록 및 관리</li>
                            <li>ABC(선행-행동-결과) 분석 도구</li>
                            <li>AI 기반 행동 코칭 및 추천</li>
                            <li>데이터 시각화 및 리포트</li>
                            <li>기타 회사가 정하는 서비스</li>
                        </ul>
                        <p>
                            ② 회사는 기술적 사양의 변경 등의 이유로 서비스의 내용을 변경할 수 있으며,
                            변경 시 그 내용 및 제공일자를 사전에 공지합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 5 조 (서비스의 중단)</h2>
                        <p>
                            ① 회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우
                            서비스의 제공을 일시적으로 중단할 수 있습니다.
                        </p>
                        <p className="mt-4">
                            ② 제1항에 의한 서비스 중단의 경우에는 회사는 사전에 공지합니다.
                            다만, 회사가 통제할 수 없는 사유로 인한 서비스의 중단으로 인하여 사전 통지가 불가능한 경우에는
                            사후에 통지할 수 있습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 6 조 (회원가입)</h2>
                        <p className="mb-4">
                            ① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써
                            회원가입을 신청합니다.
                        </p>
                        <p>
                            ② 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한
                            회원으로 등록합니다:
                        </p>
                        <ul className="list-disc list-outside space-y-2 pl-5 mt-4">
                            <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                            <li>이전에 회원자격을 상실한 적이 있는 경우 (단, 재가입 허가를 받은 경우 제외)</li>
                            <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 7 조 (회원 탈퇴 및 자격 상실)</h2>
                        <p className="mb-4">
                            ① 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원탈퇴를 처리합니다.
                        </p>
                        <p>
                            ② 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:
                        </p>
                        <ul className="list-disc list-outside space-y-2 pl-5 mt-4">
                            <li>가입 신청 시 허위 내용을 등록한 경우</li>
                            <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                            <li>서비스를 이용하여 법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 8 조 (이용자의 의무)</h2>
                        <p className="mb-4">
                            이용자는 다음 행위를 하여서는 안 됩니다:
                        </p>
                        <ul className="list-disc list-outside space-y-2 pl-5">
                            <li>신청 또는 변경 시 허위 내용의 등록</li>
                            <li>타인의 정보 도용</li>
                            <li>회사가 게시한 정보의 변경</li>
                            <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                            <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                            <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                            <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 9 조 (저작권의 귀속 및 이용제한)</h2>
                        <p className="mb-4">
                            ① 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
                        </p>
                        <p>
                            ② 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이
                            복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 10 조 (면책조항)</h2>
                        <p className="mb-4">
                            ① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                        </p>
                        <p className="mb-4">
                            ② 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
                        </p>
                        <p>
                            ③ 회사가 제공하는 AI 코칭 및 추천은 참고용이며, 전문 수의사 또는 행동 전문가의 진단을 대체하지 않습니다.
                            반려견의 건강 및 행동 문제가 심각한 경우 반드시 전문가와 상담하시기 바랍니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">제 11 조 (분쟁해결)</h2>
                        <p>
                            ① 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
                        </p>
                        <p className="mt-4">
                            ② 본 약관과 관련하여 발생한 분쟁에 대해 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed break-keep text-pretty-kr">
                        최종 수정일: 2026년 2월 15일<br />
                        시행일: 2026년 2월 15일
                    </p>
                </div>
            </div>
        </div>
    );
}
