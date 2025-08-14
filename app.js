// ===== ОСНОВНОЕ ПРИЛОЖЕНИЕ =====

// Ждем загрузки всех компонентов
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем, что все необходимое загружено
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('React не загружен');
    return;
  }
  
  if (typeof App === 'undefined') {
    console.error('Компонент App не найден');
    return;
  }
  
  // Рендерим приложение
  try {
    ReactDOM.render(React.createElement(App), document.getElementById('root'));
    console.log('Приложение успешно запущено');
  } catch (error) {
    console.error('Ошибка рендеринга:', error);
  }
});

// Альтернативный способ - если DOMContentLoaded уже сработал
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  // Небольшая задержка для гарантии загрузки всех скриптов
  setTimeout(() => {
    if (typeof App !== 'undefined') {
      try {
        ReactDOM.render(React.createElement(App), document.getElementById('root'));
        console.log('Приложение запущено с задержкой');
      } catch (error) {
        console.error('Ошибка запуска с задержкой:', error);
      }
    } else {
      console.error('App все еще не определен');
    }
  }, 100);
}
