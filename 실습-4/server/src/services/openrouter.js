const TIMEOUT_MS = 30_000;

async function requestOnce(messages, model, maxTokens) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        'X-Title': 'Fridge Ingredient Recognition',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
        messages,
      }),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function chatCompletion(messages, model, maxTokens) {
  let res = await requestOnce(messages, model, maxTokens);

  if (res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    res = await requestOnce(messages, model, maxTokens);
    if (res.status === 429) {
      const err = new Error('OPENROUTER_RATE_LIMITED');
      err.code = 'OPENROUTER_RATE_LIMITED';
      throw err;
    }
  }

  if (!res.ok) {
    const err = new Error(`OPENROUTER_REQUEST_FAILED: ${res.status}`);
    err.code = 'OPENROUTER_REQUEST_FAILED';
    throw err;
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

export async function callVisionModel(dataUrl) {
  const messages = [
    {
      role: 'system',
      content:
        '너는 냉장고 내부 사진을 분석하는 어시스턴트다. 사진 속 식재료만 한국어 명사로 추출하여 ' +
        'JSON 배열로만 응답하라. 예: ["계란","우유","양파"]. 다른 설명, 코드블록, 텍스트를 절대 포함하지 마라.',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '이 냉장고 사진에 보이는 식재료를 모두 나열해줘.' },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ];
  return chatCompletion(messages, process.env.VISION_MODEL, 500);
}

export async function callRecipeModel(ingredients) {
  const messages = [
    {
      role: 'system',
      content:
        'detailed thinking off\n' +
        '당신은 한국어로만 답변하는 요리 어시스턴트입니다. 추론 과정이나 설명 없이, 최종 결과인 ' +
        'JSON 객체 하나만 즉시 출력하세요. 주어진 재료를 최대한 활용하고, 추가로 필요한 재료는 ' +
        '최소화한 레시피 하나를 아래 JSON 형식으로만 응답하세요. ' +
        '다른 설명, 코드블록, 영어 텍스트를 절대 포함하지 마세요. difficulty는 1(아주 쉬움)부터 ' +
        '5(아주 어려움) 사이의 정수로 조리 난이도를 나타냅니다.\n' +
        '{"title": string, "usedIngredients": string[], "extraIngredients": string[], ' +
        '"steps": string[], "estimatedTimeMinutes": number, "difficulty": number}',
    },
    {
      role: 'user',
      content: `사용 가능한 재료: ${ingredients.join(', ')}`,
    },
  ];
  return chatCompletion(messages, process.env.RECIPE_MODEL, 2000);
}
