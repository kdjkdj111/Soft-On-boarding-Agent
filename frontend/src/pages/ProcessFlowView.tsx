import { GitMerge, Activity, Server, ArrowRight, PlayCircle } from 'lucide-react';

export function ProcessFlowView() {
    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-auto">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-500" />
                    CI/CD Pipeline (DevOps)
                </h2>
                <p className="text-sm text-gray-500 mt-1">빌드 및 배포 파이프라인 상태 시각화</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100 max-w-2xl w-full text-center">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-gray-400">
                                <GitMerge className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Source</span>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-500">
                                <PlayCircle className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-medium text-blue-600">Build</span>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-500">
                                <Server className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-medium text-emerald-600">Deploy</span>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        파이프라인 연동 대기 중
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                        향후 GitHub Actions 또는 Jenkins와 연동하여 실시간 빌드/배포 상태를 여기에 표시할 예정입니다.
                    </p>
                </div>
            </div>
        </div>
    );
}