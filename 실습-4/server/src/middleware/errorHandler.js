const STATUS_BY_CODE = {
  INVALID_FILE_TYPE: 400,
  LIMIT_FILE_SIZE: 400,
  NO_FILE: 400,
  NO_INGREDIENTS: 400,
  INVALID_RECIPE: 400,
  INVALID_NICKNAME: 400,
  UNAUTHORIZED: 401,
  RECIPE_NOT_FOUND: 404,
  OPENROUTER_RATE_LIMITED: 429,
  STORAGE_UPLOAD_FAILED: 502,
  OPENROUTER_REQUEST_FAILED: 502,
  AbortError: 504,
  PROFILE_FETCH_FAILED: 500,
  PROFILE_UPDATE_FAILED: 500,
  RECIPE_SAVE_FAILED: 500,
  RECIPE_LIST_FAILED: 500,
  RECIPE_FETCH_FAILED: 500,
  RECIPE_DELETE_FAILED: 500,
};

const MESSAGE_BY_CODE = {
  INVALID_FILE_TYPE: 'JPG 또는 PNG 이미지만 업로드할 수 있습니다.',
  LIMIT_FILE_SIZE: '이미지 용량은 5MB를 초과할 수 없습니다.',
  NO_FILE: '이미지를 첨부해주세요.',
  NO_INGREDIENTS: '재료를 1개 이상 입력해주세요.',
  INVALID_RECIPE: '저장할 레시피 정보가 올바르지 않습니다.',
  INVALID_NICKNAME: '닉네임을 입력해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  RECIPE_NOT_FOUND: '레시피를 찾을 수 없습니다.',
  OPENROUTER_RATE_LIMITED: '요청이 많아 잠시 후 다시 시도해주세요.',
  STORAGE_UPLOAD_FAILED: '이미지 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
  OPENROUTER_REQUEST_FAILED: '재료 인식 요청이 실패했습니다. 다시 시도해주세요.',
  AbortError: '응답 시간이 초과되었습니다. 다시 시도해주세요.',
  PROFILE_FETCH_FAILED: '프로필 정보를 불러오지 못했습니다.',
  PROFILE_UPDATE_FAILED: '프로필 수정에 실패했습니다.',
  RECIPE_SAVE_FAILED: '레시피 저장에 실패했습니다.',
  RECIPE_LIST_FAILED: '레시피 목록을 불러오지 못했습니다.',
  RECIPE_FETCH_FAILED: '레시피를 불러오지 못했습니다.',
  RECIPE_DELETE_FAILED: '레시피 삭제에 실패했습니다.',
};

export function errorHandler(err, req, res, next) {
  const code = err.code || err.name || 'INTERNAL_ERROR';
  const status = STATUS_BY_CODE[code] || 500;
  const message = MESSAGE_BY_CODE[code] || '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';

  console.error(`[에러] ${code}:`, err.cause?.message || err.message);

  res.status(status).json({ success: false, error: code, message });
}
