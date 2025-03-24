export const toast = (options: { title: string; description: string; variant?: string }) => {
    // トースト通知のロジックをここに追加
    console.log(`${options.variant || "info"}: ${options.title} - ${options.description}`);
  };
  