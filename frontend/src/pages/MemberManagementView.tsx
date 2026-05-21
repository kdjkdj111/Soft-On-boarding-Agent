import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { spaceApi, type MemberResponse } from '../services/spaceApi';
import { Users, Shield, UserMinus, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MOCK_MODE = false;

const mockMembers: MemberResponse[] = [
  { userId: 1, username: "김민준", email: "kim@example.com", jobRole: "Backend", isAdmin: true },
  { userId: 2, username: "이서연", email: "lee@example.com", jobRole: "Frontend", isAdmin: false },
  { userId: 3, username: "박지호", email: "park@example.com", jobRole: "PM", isAdmin: false },
];

export function MemberManagementView() {
  const spaceId = useAuthStore((state) => state.user?.spaceId);
  const currentUserId = useAuthStore((state) => {
    // 임시로 token 파싱해서 userId 가져온다고 가정 (실제 구현에 맞게 조정 필요)
    // 여기서는 MOCK이나 API 응답에서 내 권한을 알기 위해 본인 여부 확인용으로 쓰임
    return null; // 본인 추방 방지는 백엔드에서 주로 처리하므로 UI 방어용
  });

  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 모달 상태
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ASSIGN_ADMIN' | 'KICK';
    member: MemberResponse;
  } | null>(null);
  
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMembers = async () => {
    if (MOCK_MODE) {
      setMembers([...mockMembers]);
      setLoading(false);
      return;
    }

    if (!spaceId) return;

    try {
      setLoading(true);
      const data = await spaceApi.getMembers(spaceId);
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [spaceId]);

  const handleAction = async () => {
    if (!confirmAction || !spaceId) return;

    setActionLoading(true);
    try {
      if (confirmAction.type === 'ASSIGN_ADMIN') {
        if (!MOCK_MODE) {
          await spaceApi.assignAdmin(spaceId, confirmAction.member.userId);
        } else {
          setMembers(members.map(m => m.userId === confirmAction.member.userId ? { ...m, isAdmin: true } : m));
        }
      } else if (confirmAction.type === 'KICK') {
        if (!MOCK_MODE) {
          await spaceApi.kickMember(spaceId, confirmAction.member.userId);
        } else {
          setMembers(members.filter(m => m.userId !== confirmAction.member.userId));
        }
      }
      
      if (!MOCK_MODE) {
        await fetchMembers(); // 새로고침
      }
      setConfirmAction(null);
    } catch (error: any) {
      alert(error.message || '요청에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-gray-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            팀원 관리
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            팀 스페이스의 멤버를 관리하고 권한을 부여할 수 있습니다.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-gray-800 overflow-hidden shadow rounded-xl border border-gray-700/50">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate flex items-center gap-2">
                <Users className="w-4 h-4" />
                총 팀원 수
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-white">
                {members.length}명
              </dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-xl border border-gray-700/50">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate flex items-center gap-2">
                <Shield className="w-4 h-4" />
                관리자 수
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-white">
                {members.filter(m => m.isAdmin).length}명
              </dd>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-gray-800 shadow rounded-xl overflow-hidden border border-gray-700/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    이름
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    이메일
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    직무 (Role)
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    권한
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50 bg-gray-800">
                {members.map((member) => (
                  <tr key={member.userId} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold">
                            {member.username.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{member.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {member.jobRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Shield className="w-3 h-3" /> 관리자
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          일반 멤버
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        {!member.isAdmin ? (
                          <button
                            onClick={() => setConfirmAction({ type: 'ASSIGN_ADMIN', member })}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            관리자 지정
                          </button>
                        ) : (
                          <span className="text-gray-500 cursor-not-allowed">관리자</span>
                        )}
                        <button
                          onClick={() => setConfirmAction({ type: 'KICK', member })}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          추방
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={() => !actionLoading && setConfirmAction(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="relative inline-block align-bottom bg-gray-800 rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-700">
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                  confirmAction.type === 'KICK' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {confirmAction.type === 'KICK' ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    {confirmAction.type === 'KICK' ? '팀원 추방' : '관리자 권한 부여'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      정말 <strong className="text-gray-200">{confirmAction.member.username}</strong>님
                      {confirmAction.type === 'KICK' 
                        ? '을(를) 팀에서 추방하시겠습니까? 이 작업은 되돌릴 수 없습니다.' 
                        : '에게 관리자 권한을 부여하시겠습니까?'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 sm:w-auto transition-all ${
                    confirmAction.type === 'KICK' 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  } ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleAction}
                >
                  {actionLoading ? '처리 중...' : confirmAction.type === 'KICK' ? '추방하기' : '권한 부여'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-600 shadow-sm px-4 py-2.5 bg-transparent text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none sm:mt-0 sm:w-auto transition-colors"
                  onClick={() => setConfirmAction(null)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
