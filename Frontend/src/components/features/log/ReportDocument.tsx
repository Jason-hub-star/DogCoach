"use client";

import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { TrainingCourse } from "@/data/curriculum";
import { DESIGN_COLORS } from "@/lib/theme/colors";

// Register Korean Font (using Noto Sans KR from Google Fonts or similar CDN)
// Note: Direct URL sometimes fails due to CORS, but let's try a reliable source or use a locally imported font if available.
// For this demo, we use a standard CDN. If it fails, letters might optionally disappear.
Font.register({
    family: "NotoSansKR",
    fonts: [
        {
            src: "https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLQ.ttf",
            fontWeight: 400
        },
        {
            src: "https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf",
            fontWeight: 700
        }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "NotoSansKR",
        backgroundColor: DESIGN_COLORS.white
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: DESIGN_COLORS.gray200,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
        color: DESIGN_COLORS.zinc800
    },
    subtitle: {
        fontSize: 10,
        color: DESIGN_COLORS.zinc500
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: DESIGN_COLORS.zinc800,
        backgroundColor: DESIGN_COLORS.brandLimePale,
        padding: 5,
        borderRadius: 4
    },
    text: {
        fontSize: 10,
        marginBottom: 5,
        lineHeight: 1.5,
        color: DESIGN_COLORS.zinc700
    },
    grid: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        marginBottom: 10
    },
    statCard: {
        flex: 1,
        padding: 10,
        backgroundColor: DESIGN_COLORS.gray100,
        borderRadius: 5
    },
    statLabel: {
        fontSize: 8,
        color: DESIGN_COLORS.zinc500
    },
    statValue: {
        fontSize: 12,
        fontWeight: "bold",
        color: DESIGN_COLORS.zinc800
    },
    chartImage: {
        width: "100%",
        height: 350,
        marginBottom: 10,
        objectFit: "contain"
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: "center",
        fontSize: 8,
        color: DESIGN_COLORS.zinc400,
        borderTopWidth: 1,
        borderTopColor: DESIGN_COLORS.gray200,
        paddingTop: 10
    }
});

interface ReportDocumentProps {
    dogName: string;
    logs: any[];
    chartImage?: string; // DataURL captured from html2canvas
    recommendedCourse: TrainingCourse;
    aiAnalysis?: {
        insight: string;
        action_plan: string;
        dog_voice: string;
        top_patterns?: string[];
        next_7_days_plan?: string[];
        risk_signals?: string[];
        consultation_questions?: string[];
    };
}

// Landing preview can reuse this to keep message/data tone aligned with actual report output.
export const REPORT_SAMPLE_PREVIEW = {
    dogName: "Mong",
    logs: [
        { occurred_at: "2026-02-10T08:10:00Z", antecedent: "doorbell", behavior: "Barking", intensity: 8 },
        { occurred_at: "2026-02-09T12:35:00Z", antecedent: "stranger", behavior: "Barking", intensity: 7 },
        { occurred_at: "2026-02-08T21:00:00Z", antecedent: "separation", behavior: "Whining", intensity: 6 },
    ],
    summary: {
        mainTrigger: "초인종 / 방문자",
        weeklyChange: "-18%",
        confidence: "89%",
    },
    aiAnalysis: {
        insight: "오후 7시~10시에 현관 자극(초인종/복도 소리)과 짖음이 함께 증가합니다.",
        action_plan: "현관 벨 소리 노출 강도를 낮춘 단계별 탈감작 + 대체행동(자리 지키기) 루틴이 우선입니다.",
        dog_voice: "갑자기 큰 소리가 나면 놀라서 먼저 짖게 돼요. 익숙해질 시간을 주세요.",
    },
};

export function ReportDocument({ dogName, logs, chartImage, recommendedCourse, aiAnalysis }: ReportDocumentProps) {
    const totalLogs = logs.length;
    const lastLog = logs[0]?.occurred_at ? new Date(logs[0].occurred_at).toLocaleDateString() : "-";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>DogCoach 데이터 문진표</Text>
                    <Text style={styles.subtitle}>{dogName}의 행동 분석 리포트 | 생성일: {new Date().toLocaleDateString()}</Text>
                </View>

                {/* Summary Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. 기록 요약</Text>
                    <View style={styles.grid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>총 기록 수</Text>
                            <Text style={styles.statValue}>{totalLogs}회</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>최근 기록일</Text>
                            <Text style={styles.statValue}>{lastLog}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>주요 원인</Text>
                            <Text style={styles.statValue}>{recommendedCourse.title.split("]")[0].replace("[", "")}</Text>
                        </View>
                    </View>
                    {aiAnalysis ? (
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ ...styles.text, fontWeight: "bold" }}>[AI 전문가 총평]</Text>
                            <Text style={styles.text}>{aiAnalysis.insight}</Text>
                        </View>
                    ) : (
                        <Text style={styles.text}>데이터 분석 중입니다...</Text>
                    )}
                </View>

                {/* Charts (Image) */}
                {chartImage && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. 데이터 시각화</Text>
                        <Image src={chartImage} style={styles.chartImage} />
                        <Text style={styles.subtitle}>* 위 차트는 행동 발생 빈도와 시간대 패턴을 시각화한 것입니다.</Text>
                    </View>
                )}

                {/* Recommendation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. AI 맞춤 추천 솔루션</Text>
                    <Text style={{ ...styles.text, fontSize: 12, fontWeight: "bold" }}>추천 코스: {recommendedCourse.title}</Text>
                    <Text style={styles.text}>{recommendedCourse.description}</Text>
                    {aiAnalysis?.action_plan && <Text style={styles.text}>{aiAnalysis.action_plan}</Text>}

                    <Text style={{ ...styles.text, marginTop: 10 }}>[주요 단계]</Text>
                    {recommendedCourse.stages.slice(0, 3).map((stage, idx) => (
                        <Text key={stage.id} style={styles.text}>
                            {idx + 1}. {stage.title}: {stage.goal}
                        </Text>
                    ))}
                </View>

                {aiAnalysis?.top_patterns?.length ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. 최근 패턴 핵심 요약</Text>
                        {aiAnalysis.top_patterns.slice(0, 3).map((pattern, idx) => (
                            <Text key={`pattern-${idx}`} style={styles.text}>
                                {idx + 1}. {pattern}
                            </Text>
                        ))}
                    </View>
                ) : null}

                {aiAnalysis?.next_7_days_plan?.length ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. 다음 7일 실행 계획</Text>
                        {aiAnalysis.next_7_days_plan.slice(0, 3).map((plan, idx) => (
                            <Text key={`plan-${idx}`} style={styles.text}>
                                {idx + 1}. {plan}
                            </Text>
                        ))}
                    </View>
                ) : null}

                {aiAnalysis?.risk_signals?.length ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. 악화 신호 체크</Text>
                        {aiAnalysis.risk_signals.slice(0, 2).map((signal, idx) => (
                            <Text key={`risk-${idx}`} style={styles.text}>
                                - {signal}
                            </Text>
                        ))}
                    </View>
                ) : null}

                {aiAnalysis?.consultation_questions?.length ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. 상담 시 질문 가이드</Text>
                        {aiAnalysis.consultation_questions.slice(0, 2).map((question, idx) => (
                            <Text key={`question-${idx}`} style={styles.text}>
                                - {question}
                            </Text>
                        ))}
                    </View>
                ) : null}

                {aiAnalysis && (
                    <View style={{ marginTop: 15, padding: 15, backgroundColor: DESIGN_COLORS.orange100, borderRadius: 8, borderStyle: "dashed", borderWidth: 1, borderColor: DESIGN_COLORS.orange300 }}>
                        <Text style={{ ...styles.text, fontSize: 11, fontWeight: "bold", color: DESIGN_COLORS.orange700, marginBottom: 8 }}>🐾 {dogName}가 보내는 마음의 편지</Text>
                        <Text style={{ ...styles.text, color: DESIGN_COLORS.orange800 }}>{aiAnalysis.dog_voice}</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    DogCoach - 데이터 기반 반려견 행동 코칭 서비스
                </Text>
            </Page>
        </Document>
    );
}
