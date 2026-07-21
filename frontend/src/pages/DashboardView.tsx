import React, { useState, useEffect, useRef } from 'react';
import { spaceApi } from '../services/spaceApi';
import type { BoardTaskDto, CommitHistoryDto } from '../services/spaceApi';
import { useAuthStore } from '../store/authStore';
import {
    CheckCircle2,
    Circle,
    Clock,
    GitBranch,
    X,
    Loader2,
    AlertTriangle,
    RefreshCw,
    ArrowRight,
    Check,
    Box,
    Layers,
    Hexagon,
    Component,
    Package,
    Code2,
    GitCommit,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 커밋 필터링 — Major(핵심) 커밋만 추출
// ─────────────────────────────────────────────────────────────────────────────

const MAJOR_PATTERNS = [
    // 1. 관례적 커밋
    /^feat(\(.+\))?:/i,
    /^feature(\(.+\))?:/i,
    /^BREAKING CHANGE/i,
    
    // 2. 핵심 이모지 (기능, 파괴적 변경, 시작, 배포) - 깃모지 안전망
    /^✨/, /^💥/, /^🎉/, /^🚀/,
    
    // 2. 영문 자연어 동사
    /^(Add|Implement|Create|Setup|Release|Launch)\s+/i,

    // 3. 한글 키워드
    /^(추가|구현|개발|완료|셋업|배포)[\s:]/i,
];

const NOISE_PATTERNS = [
    /^fix(\(.+\))?:/i,
    /^docs(\(.+\))?:/i,
    /^chore(\(.+\))?:/i,
    /^style(\(.+\))?:/i,
    /^refactor(\(.+\))?:/i,
    /^test(\(.+\))?:/i,
    /^ci(\(.+\))?:/i,
    /^build(\(.+\))?:/i,
    /^perf(\(.+\))?:/i,
    /^revert(\(.+\))?:/i,
    /^Merge (branch|pull request)/i,
    /^Update\s+(README|docs|\.md)/i,
    /^Initial commit/i,
    /^wip:/i,
];

function isMajorCommit(message: string): boolean {
    const msg = message.trim();
    if (NOISE_PATTERNS.some(p => p.test(msg))) return false;
    return MAJOR_PATTERNS.some(p => p.test(msg));
}

function filterMajorCommits(commits: CommitHistoryDto[]): CommitHistoryDto[] {
    return commits.filter(c => isMajorCommit(c.message));
}

// ─────────────────────────────────────────────────────────────────────────────
// 날짜 포맷
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function cleanTitle(message: string): string {
    return message
        .replace(/^(feat|feature|✨|💥|BREAKING CHANGE|Add|Implement|Release|Launch)(\(.+?\))?:\s*/i, '')
        .split('\n')[0]
        .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// 테마 색상 (풍성한 그라데이션 및 색상 매핑)
// ─────────────────────────────────────────────────────────────────────────────

const THEME_COLORS = [
    {
        badge: 'bg-violet-50 text-violet-600 border-violet-200',
        iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-500',
        dot: 'bg-violet-500',
        line: 'from-violet-200 to-blue-200',
    },
    {
        badge: 'bg-blue-50 text-blue-600 border-blue-200',
        iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
        dot: 'bg-blue-500',
        line: 'from-blue-200 to-emerald-200',
    },
    {
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
        dot: 'bg-emerald-500',
        line: 'from-emerald-200 to-amber-200',
    },
    {
        badge: 'bg-amber-50 text-amber-600 border-amber-200',
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        dot: 'bg-amber-500',
        line: 'from-amber-200 to-rose-200',
    },
    {
        badge: 'bg-rose-50 text-rose-600 border-rose-200',
        iconBg: 'bg-gradient-to-br from-rose-400 to-pink-500',
        dot: 'bg-rose-500',
        line: 'from-rose-200 to-violet-200',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// MilestoneNode
// ─────────────────────────────────────────────────────────────────────────────

const THEME_ICONS = [
    Layers,
    Component,
    Hexagon,
    Box,
    Package,
    Code2,
];

function MilestoneNode({
    commit,
    index,
    isLast,
}: {
    commit: CommitHistoryDto;
    index: number;
    isLast: boolean;
}) {
    const theme = THEME_COLORS[index % THEME_COLORS.length];
    const Icon = THEME_ICONS[index % THEME_ICONS.length];
    const stepNum = index + 1;
    const title = cleanTitle(commit.message) || commit.message;

    return (
        <div className="flex flex-col relative flex-shrink-0" style={{ width: '260px' }}>
            
            {/* 연결선 (카드 뒤로 지나감) */}
            {!isLast && (
                <div className="absolute top-[80px] left-[50%] w-full flex items-center z-0">
                    <div className={`h-[2px] w-full bg-gradient-to-r ${theme.line} opacity-60`} />
                    <ArrowRight className="w-4 h-4 text-gray-300 -ml-2 bg-white rounded-full flex-shrink-0" />
                </div>
            )}

            {/* 메인 노드 구조 */}
            <div className="flex flex-col items-center w-full z-10 px-4">
                
                {/* Step 뱃지 / Latest 뱃지 */}
                {isLast ? (
                    <span className="mb-4 px-5 py-1 rounded-full text-[12px] font-bold tracking-widest uppercase bg-blue-500 text-white shadow-sm ring-2 ring-blue-200 border border-blue-500 z-10">
                        LATEST
                    </span>
                ) : (
                    <span className={`mb-4 px-4 py-1 rounded-full text-[12px] font-bold tracking-widest uppercase border shadow-sm z-10 ${theme.badge}`}>
                        Step {stepNum}
                    </span>
                )}

                {/* 그라데이션 아이콘 박스 */}
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-white z-10 ${theme.iconBg}`}>
                    <Icon className="w-7 h-7" strokeWidth={1.75} />
                </div>

                {/* 닷(Dot) */}
                <div className={`w-2 h-2 rounded-full mt-4 mb-4 shadow-sm z-10 ${theme.dot}`} />

                {/* 텍스트 흰색 카드 */}
                <div className={`w-full bg-white rounded-2xl shadow-md p-4 min-h-[96px] flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 cursor-default z-10
                    ${isLast ? 'border-2 border-blue-400 ring-2 ring-blue-50' : 'border border-gray-100'}`}>
                    <p className="text-[13px] font-bold text-gray-800 leading-snug text-center line-clamp-3">
                        {title}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <img src={`https://github.com/${commit.author}.png?size=32`} 
                                 alt={commit.author}
                                 onError={(e) => { e.currentTarget.src = 'https://github.com/identicon.png'; }}
                                 className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                            <span className="text-[11px] font-medium text-gray-400 truncate max-w-[80px]">
                                {commit.author}
                            </span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-300 flex-shrink-0">
                            {formatDate(commit.commitDate)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TodoCard
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard — Todo / In Progress / Done 공용 카드
// ─────────────────────────────────────────────────────────────────────────────

/** Todo 카드: 원형 버튼 클릭 → In Progress */
function TodoCard({
    task,
    onAdvance,
    onDelete,
}: {
    task: BoardTaskDto;
    onAdvance: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const [leaving, setLeaving] = useState(false);
    const handleAdvance = () => {
        setLeaving(true);
        setTimeout(() => onAdvance(task.id), 280);
    };
    return (
        <div className={`group flex items-start gap-2.5 bg-white rounded-lg border border-gray-200 p-3
            hover:border-gray-300 transition-all duration-200
            ${leaving ? 'opacity-0 translate-x-2 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}>
            <button
                id={`task-advance-${task.id}`}
                onClick={handleAdvance}
                title="In Progress로 이동"
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border border-gray-300
                    hover:border-blue-400 hover:bg-blue-50 transition-all duration-150
                    flex items-center justify-center group/btn"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover/btn:bg-blue-400 transition-colors" />
            </button>
            <p className="flex-1 text-sm text-gray-700 leading-relaxed break-words pt-0.5">{task.title}</p>
            <button
                id={`task-delete-${task.id}`}
                onClick={() => onDelete(task.id)}
                title="삭제"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

/** In Progress 카드: 체크 버튼 클릭 → Done */
function InProgressCard({
    task,
    onAdvance,
    onDelete,
}: {
    task: BoardTaskDto;
    onAdvance: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40);
        return () => clearTimeout(t);
    }, []);

    const handleAdvance = () => {
        setLeaving(true);
        setTimeout(() => onAdvance(task.id), 280);
    };

    return (
        <div className={`group flex items-start gap-2.5 bg-white rounded-lg border border-gray-200 p-3
            hover:border-gray-300 transition-all duration-200
            ${leaving ? 'opacity-0 translate-x-2 scale-95' : visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <button
                id={`inprogress-advance-${task.id}`}
                onClick={handleAdvance}
                title="Done으로 이동"
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border border-amber-300 bg-amber-50
                    hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-150
                    flex items-center justify-center group/btn"
            >
                <Check className="w-2.5 h-2.5 text-amber-400 group-hover/btn:text-emerald-500 transition-colors" />
            </button>
            <p className="flex-1 text-sm text-gray-700 leading-relaxed break-words pt-0.5">{task.title}</p>
            <button
                id={`inprogress-delete-${task.id}`}
                onClick={() => onDelete(task.id)}
                title="삭제"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

/** Done 카드: 완료 상태, 취소선 */
function DoneCard({
    task,
    onDelete,
}: {
    task: BoardTaskDto;
    onDelete: (id: number) => void;
}) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className={`group flex items-start gap-2.5 bg-white rounded-lg border border-gray-100 p-3
            transition-all duration-200
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300
                flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-500" />
            </div>
            <p className="flex-1 text-sm text-gray-400 leading-relaxed break-words pt-0.5 line-through">{task.title}</p>
            <button
                id={`done-delete-${task.id}`}
                onClick={() => onDelete(task.id)}
                title="삭제"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardView() {
    const { user } = useAuthStore();
    const teamCode = user?.teamCode ?? null;
    const spaceId = user?.spaceId ?? null;

    // ── 커밋 상태 ──
    const [majorCommits, setMajorCommits] = useState<CommitHistoryDto[]>([]);
    const [isCommitLoading, setIsCommitLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [commitError, setCommitError] = useState<string | null>(null);

    // ── 태스크 상태 ──
    const [tasks, setTasks] = useState<BoardTaskDto[]>([]);
    const [isTaskLoading, setIsTaskLoading] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // 커밋 로드 완료 후 타임라인을 맨 오른쪽(최신 커밋)으로 스크롤
    useEffect(() => {
        if (majorCommits.length > 0 && timelineRef.current) {
            timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
        }
    }, [majorCommits]);

    /** 커밋 로드: DB에 없으면 GitHub에서 자동 동기화 */
    const loadCommits = async (code: string, forceSync = false) => {
        setIsCommitLoading(true);
        setCommitError(null);
        try {
            let data: CommitHistoryDto[];
            if (forceSync) {
                setIsSyncing(true);
                data = await spaceApi.syncCommits(code);
            } else {
                data = await spaceApi.getCommits(code);
            }
            const majors = filterMajorCommits(data);
            setMajorCommits(majors);
        } catch (e: any) {
            setCommitError(e?.message ?? '커밋 내역을 불러올 수 없습니다.');
        } finally {
            setIsSyncing(false);
            setIsCommitLoading(false);
        }
    };

    // ── 데이터 로드 ──
    useEffect(() => {
        if (!teamCode || !spaceId) return;

        (async () => {
            setIsTaskLoading(true);
            setIsCommitLoading(true);
            setCommitError(null);
            try {
                const data = await spaceApi.getDashboardView(spaceId);
                setTasks(data.tasks);
                const majors = filterMajorCommits(data.commits);
                setMajorCommits(majors);
            } catch (e: any) {
                console.error('Dashboard load failed:', e);
                setCommitError(e?.message ?? '대시보드 데이터를 불러올 수 없습니다.');
            } finally {
                setIsTaskLoading(false);
                setIsCommitLoading(false);
            }
        })();
    }, [teamCode, spaceId]);

    // ── 태스크 핸들러 ──
    const handleAddTask = async () => {
        if (!teamCode || !newTaskText.trim()) return;
        setIsAdding(true);
        try {
            const created = await spaceApi.createTask(teamCode, newTaskText.trim());
            setTasks(prev => [created, ...prev]);
            setNewTaskText('');
            inputRef.current?.focus();
        } catch (e) {
            console.error('Create task failed:', e);
        } finally {
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAddTask();
    };

    const handleCheck = async (taskId: number) => {
        if (!teamCode) return;
        try {
            const updated = await spaceApi.updateTaskStatus(teamCode, taskId, 'IN_PROGRESS');
            setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
        } catch (e) {
            console.error('Status update failed:', e);
        }
    };

    const handleDelete = async (taskId: number) => {
        if (!teamCode) return;
        try {
            await spaceApi.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (e) {
            console.error('Delete failed:', e);
        }
    };

    const todoTasks       = tasks.filter(t => t.status === 'TODO');
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
    const doneTasks       = tasks.filter(t => t.status === 'DONE');

    /** IN_PROGRESS → DONE */
    const handleComplete = async (taskId: number) => {
        if (!teamCode) return;
        try {
            const updated = await spaceApi.updateTaskStatus(teamCode, taskId, 'DONE');
            setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
        } catch (e) {
            console.error('Complete failed:', e);
        }
    };

    // ── 팀 미소속 ──
    if (!teamCode) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <p className="text-sm text-gray-500">팀 스페이스에 참여한 후 이용할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

            {/* ================================================================
                TOP — 프로젝트 로드맵 (타임라인)
            ================================================================ */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200" style={{ height: '42%' }}>

                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">프로젝트 로드맵</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            핵심 기능 커밋만 표시&nbsp;·&nbsp;
                            <span className="font-mono text-gray-500">{teamCode}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* 범례 */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <GitCommit className="w-3.5 h-3.5 text-gray-400" />
                            <span>핵심 기능(Feature) 구현 내역만 필터링</span>
                        </div>
                        {/* 새로고침 버튼 */}
                        <button
                            id="commit-refresh-btn"
                            onClick={() => teamCode && loadCommits(teamCode, true)}
                            disabled={isCommitLoading}
                            title="GitHub에서 최신 커밋 재동기화"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500
                                border border-gray-200 rounded-lg bg-white hover:bg-gray-50
                                disabled:opacity-40 transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isCommitLoading ? 'animate-spin' : ''}`} />
                            {isSyncing ? '동기화 중...' : '새로고침'}
                        </button>
                    </div>
                </div>

                {/* 타임라인 (가로 스크롤) */}
                <div
                    ref={timelineRef}
                    className="overflow-x-auto overflow-y-hidden py-5"
                    style={{ height: 'calc(100% - 65px)' }}
                >
                    {isCommitLoading ? (
                        <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">
                                {isSyncing ? 'GitHub에서 커밋 동기화 중...' : '커밋 내역 불러오는 중...'}
                            </span>
                        </div>

                    ) : commitError ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <AlertTriangle className="w-7 h-7 text-amber-400" />
                            <p className="text-sm text-gray-500">{commitError}</p>
                            <button
                                id="commit-retry-btn"
                                onClick={() => teamCode && loadCommits(teamCode, true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600
                                    border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                GitHub에서 재동기화
                            </button>
                        </div>

                    ) : majorCommits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                            <GitBranch className="w-8 h-8 text-gray-300" />
                            <p className="text-sm">표시할 핵심 커밋이 없습니다.</p>
                            <p className="text-xs text-gray-400">
                                <code className="bg-gray-100 px-1 rounded text-gray-500">feat:</code> 커밋이 있어야 로드맵에 표시됩니다.
                            </p>
                            <button
                                id="commit-sync-btn"
                                onClick={() => teamCode && loadCommits(teamCode, true)}
                                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500
                                    border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                GitHub에서 다시 동기화
                            </button>
                        </div>

                    ) : (
                        <div className="flex items-center h-full">
                            {/* ── 좌측: 최근 100개 한계 안내 ── */}
                            <div className="flex items-center flex-shrink-0 mr-4 pl-6">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-dashed border-gray-200
                                        rounded-lg px-2.5 py-2 max-w-[130px]">
                                        <span className="text-[10px] text-gray-400 leading-snug text-center">
                                            최근 100개의 커밋 중<br/>
                                            <span className="font-semibold text-gray-500">주요 핵심 마일스톤</span>만<br/>
                                            추출하여 표시합니다
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 text-gray-300">
                                        <div className="w-4 h-px bg-gray-200" />
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>

                            {/* ── 커밋 노드들 ── */}
                            {majorCommits.map((commit, idx) => (
                                <MilestoneNode
                                    key={commit.id}
                                    commit={commit}
                                    index={idx}
                                    isLast={idx === majorCommits.length - 1}
                                />
                            ))}

                            {/* ── 우측 여백: 마지막 카드가 화면 중간까지 올 수 있게 여유 공간 ── */}
                            <div className="flex-shrink-0 w-[40vw] h-full" aria-hidden="true" />
                        </div>
                    )}
                </div>
            </div>

            {/* ================================================================
                BOTTOM — 칸반 보드 (To Do · In Progress · Done)
            ================================================================ */}
            <div className="flex-1 flex overflow-hidden min-h-0">

                {/* ── To Do 열 ── */}
                <div className="flex-1 flex flex-col border-r border-gray-200 overflow-hidden bg-white">
                    <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Circle className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500 tracking-wider">To Do</span>
                        </div>
                        <span className="bg-gray-100 text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {todoTasks.length}
                        </span>
                    </div>

                    {/* 입력창 */}
                    <div className="flex-shrink-0 px-3 pt-3 pb-2">
                        <div className="flex gap-2 items-center bg-gray-50 border border-gray-200
                            rounded-lg px-3 py-2 focus-within:bg-white focus-within:border-blue-400
                            focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                            <input
                                id="todo-input"
                                ref={inputRef}
                                type="text"
                                value={newTaskText}
                                onChange={e => setNewTaskText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="+ 할 일 추가 (Enter)"
                                className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                            />
                            {isAdding && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0" />}
                        </div>
                    </div>

                    {/* 카드 목록 */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 min-h-0">
                        {isTaskLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
                            </div>
                        ) : todoTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-1.5
                                text-gray-300">
                                <Circle className="w-6 h-6" />
                                <p className="text-xs">할 일을 추가해보세요</p>
                            </div>
                        ) : (
                            todoTasks.map(task => (
                                <TodoCard
                                    key={task.id}
                                    task={task}
                                    onAdvance={handleCheck}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* ── In Progress 열 ── */}
                <div className="flex-1 flex flex-col border-r border-gray-200 overflow-hidden bg-gray-50/40">
                    <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border-2 border-amber-400 flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-amber-400" />
                            </div>
                            <span className="text-xs font-semibold text-amber-600 tracking-wider">In Progress</span>
                        </div>
                        <span className="bg-amber-50 text-amber-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {inProgressTasks.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-3 pt-3 space-y-1.5 min-h-0">
                        {inProgressTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-1.5 text-gray-300">
                                <Clock className="w-6 h-6" />
                                <p className="text-xs">진행 중인 항목이 없습니다</p>
                            </div>
                        ) : (
                            inProgressTasks.map(task => (
                                <InProgressCard
                                    key={task.id}
                                    task={task}
                                    onAdvance={handleComplete}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* ── Done 열 ── */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/40">
                    <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600 tracking-wider">Done</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {doneTasks.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-3 pt-3 space-y-1.5 min-h-0">
                        {doneTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-1.5 text-gray-300">
                                <CheckCircle2 className="w-6 h-6" />
                                <p className="text-xs">완료된 항목이 없습니다</p>
                            </div>
                        ) : (
                            doneTasks.map(task => (
                                <DoneCard
                                    key={task.id}
                                    task={task}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}