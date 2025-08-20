// Debug utility to help clear problematic session storage for saved places

export const clearAllQuestionnaireSessionStorage = () => {
  const allKeys = Object.keys(sessionStorage);
  const questionnaireKeys = allKeys.filter(key => 
    key.includes('temp') && 
    (key.includes('questionnaire') || key.includes('Questionnaire'))
  );
  
  console.log('🧹 Clearing all questionnaire session storage:', questionnaireKeys);
  questionnaireKeys.forEach(key => sessionStorage.removeItem(key));
  
  return questionnaireKeys.length;
};

export const clearSavedPlaceQuestionnaireStorage = (destinationId: string) => {
  const allKeys = Object.keys(sessionStorage);
  const keysToRemove = allKeys.filter(key =>
    (key.includes('questionnaire') || key.includes('Questionnaire')) &&
    !key.includes(`_saved_${destinationId}`)
  );
  
  console.log(`🧹 Clearing non-saved questionnaire storage for destination ${destinationId}:`, keysToRemove);
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
  
  return keysToRemove.length;
};

export const debugSessionStorage = () => {
  const allKeys = Object.keys(sessionStorage);
  const questionnaireKeys = allKeys.filter(key => 
    key.includes('temp') && 
    (key.includes('questionnaire') || key.includes('Questionnaire'))
  );
  
  console.log('📋 Current questionnaire session storage:');
  questionnaireKeys.forEach(key => {
    console.log(`  ${key}: ${sessionStorage.getItem(key)}`);
  });
  
  return questionnaireKeys;
};

// Add to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).debugSessionStorage = debugSessionStorage;
  (window as any).clearAllQuestionnaireSessionStorage = clearAllQuestionnaireSessionStorage;
  (window as any).clearSavedPlaceQuestionnaireStorage = clearSavedPlaceQuestionnaireStorage;
}
