export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-10 md:py-12 px-4 sm:px-5">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 sm:p-8 md:p-12">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-8 break-keep text-balance-kr">개인정보 처리방침</h1>

                <div className="space-y-8 text-gray-700 legal-copy-mobile break-keep text-pretty-kr">
                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">1. 개인정보의 수집 및 이용 목적</h2>
                        <p className="mb-4">
                            TailLog("회사"라 함)는 다음의 목적을 위하여 개인정보를 처리합니다.
                            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                            이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                        </p>
                        <ul className="list-disc list-outside space-y-2 pl-5">
                            <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                            <li>서비스 제공: 반려견 행동 기록 관리, AI 코칭 서비스 제공, 맞춤형 콘텐츠 제공</li>
                            <li>고객 지원: 문의사항 응대, 고객 불만 처리</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">2. 수집하는 개인정보 항목</h2>
                        <ul className="list-disc list-outside space-y-2 pl-5">
                            <li>필수항목: 이메일 주소, Google 계정 정보 (OAuth 로그인 시)</li>
                            <li>선택항목: 반려견 정보 (이름, 품종, 생년월일, 프로필 사진), 전화번호</li>
                            <li>자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">3. 개인정보의 보유 및 이용기간</h2>
                        <p>
                            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                            회원 탈퇴 시 지체없이 파기하며, 다만 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 안전하게 보관합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">4. 개인정보의 제3자 제공</h2>
                        <p>
                            회사는 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">5. 정보주체의 권리·의무 및 행사방법</h2>
                        <p className="mb-4">
                            정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                        </p>
                        <ul className="list-disc list-outside space-y-2 pl-5">
                            <li>개인정보 열람 요구</li>
                            <li>개인정보 오류 등이 있을 경우 정정 요구</li>
                            <li>개인정보 삭제 요구</li>
                            <li>개인정보 처리정지 요구</li>
                        </ul>
                        <p className="mt-4">
                            권리 행사는 설정 페이지 또는 이메일(umjitak@gmail.com)을 통해 가능합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">6. 개인정보 보호책임자</h2>
                        <p>
                            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여
                            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                        </p>
                        <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                            <p className="font-semibold">개인정보 보호책임자</p>
                            <p>이메일: umjitak@gmail.com</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">7. 개인정보 처리방침 변경</h2>
                        <p>
                            이 개인정보 처리방침은 2026년 2월 15일부터 적용됩니다.
                            법령·정책 또는 보안기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 시에는
                            변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
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
