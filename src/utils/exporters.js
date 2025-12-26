// 数据导出工具函数

const exporters = {
  // 导出为 JSON 文件
  exportJSON(data, filename = 'data.json') {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
      this.downloadBlob(blob, filename);
      return true;
    } catch (error) {
      console.error('Export JSON error:', error);
      return false;
    }
  },

  // 导出为 CSV 文件
  exportCSV(data, filename = 'data.csv') {
    try {
      // 如果是对象数组，转换为 CSV
      if (Array.isArray(data)) {
        if (data.length === 0) return false;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','), // 头部
          ...data.map(row => {
            return headers.map(header => {
              // 处理包含逗号、引号或换行符的字段
              const cell = row[header];
              if (cell === null || cell === undefined) return '';
              const cellStr = String(cell);
              if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            }).join(',');
          })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        this.downloadBlob(blob, filename);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Export CSV error:', error);
      return false;
    }
  },

  // 导出为 TXT 文件
  exportTXT(data, filename = 'data.txt') {
    try {
      let textContent = '';
      
      if (typeof data === 'string') {
        textContent = data;
      } else if (typeof data === 'object') {
        textContent = JSON.stringify(data, null, 2);
      } else {
        textContent = String(data);
      }
      
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      this.downloadBlob(blob, filename);
      return true;
    } catch (error) {
      console.error('Export TXT error:', error);
      return false;
    }
  },

  // 导出为图片
  exportImage(element, filename = 'image.png') {
    try {
      if (!element) return false;
      
      // 检查是否是 ECharts 实例
      if (element.getWidth && element.getHeight && element.getDataURL) {
        // ECharts 实例
        const dataURL = element.getDataURL({
          pixelRatio: 2, // 提高分辨率
          backgroundColor: '#121829' // 背景色
        });
        this.downloadDataURL(dataURL, filename);
        return true;
      } 
      // 检查是否是 DOM 元素
      else if (element instanceof HTMLElement) {
        // 尝试使用 html2canvas（需要额外引入）
        if (window.html2canvas) {
          window.html2canvas(element, {
            backgroundColor: '#121829',
            scale: 2
          }).then(canvas => {
            const dataURL = canvas.toDataURL('image/png');
            this.downloadDataURL(dataURL, filename);
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Export Image error:', error);
      return false;
    }
  },

  // 下载 Blob
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // 下载 DataURL
  downloadDataURL(dataURL, filename) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 格式化文件名（添加时间戳）
  formatFilename(originalName, addTimestamp = true) {
    if (!addTimestamp) return originalName;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const nameParts = originalName.split('.');
    const extension = nameParts.pop();
    const name = nameParts.join('.');
    return `${name}_${timestamp}.${extension}`;
  },

  // 压缩 JSON 数据
  compressJSON(data) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Compress JSON error:', error);
      return null;
    }
  },

  // 批量导出
  exportBatch(items, type = 'json', baseFilename = 'batch') {
    try {
      items.forEach((item, index) => {
        const filename = `${baseFilename}_${index + 1}.${type}`;
        switch (type.toLowerCase()) {
          case 'json':
            this.exportJSON(item, filename);
            break;
          case 'csv':
            this.exportCSV(item, filename);
            break;
          case 'txt':
            this.exportTXT(item, filename);
            break;
          default:
            this.exportJSON(item, filename);
        }
      });
      return true;
    } catch (error) {
      console.error('Export batch error:', error);
      return false;
    }
  }
};

export default exporters;
