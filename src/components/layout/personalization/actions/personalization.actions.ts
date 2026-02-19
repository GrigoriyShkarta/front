import { api } from '@/lib/api';
import { PersonalizationFormData } from '@/schemas/personalization';

/**
 * Updates space personalization settings.
 * Handles file upload for the icon.
 */
export const updatePersonalization = async (data: PersonalizationFormData) => {
  const form_data = new FormData();
  
  // Append fields
  form_data.append('title_space', data.title_space);
  form_data.append('primary_color', data.primary_color);
  form_data.append('secondary_color', data.secondary_color);
  form_data.append('bg_color', data.bg_color);
  form_data.append('bg_color_dark', data.bg_color_dark);
  form_data.append('select_mode', String(data.select_mode));
  form_data.append('is_white_sidebar_color', String(data.is_white_sidebar_color));
  form_data.append('font_family', data.font_family);
  form_data.append('is_show_sidebar_icon', String(data.is_show_sidebar_icon))
  
  // Append languages array
  data.languages.forEach((lang) => {
    form_data.append('languages[]', lang);
  });
  
  // Append icon if it's a file, but use 'icon_file' key for backend
  if (data.icon instanceof File) {
    form_data.append('icon', data.icon);
  }

  const response = await api.post('/space', form_data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
