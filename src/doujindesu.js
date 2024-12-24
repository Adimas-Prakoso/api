import axios from 'axios';
import * as cheerio from 'cheerio';

const getTypeDoujindesu = async (page = 1, type = 'Doujinshi') => {
  try {
    const response = await axios.post('https://api.brightdata.com/request', {
      zone: 'doujin',
      url: `https://doujindesu.tv/manga/page/${page}/?type=${type}`,
      format: 'raw'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 2de006f706f0280a42bd3effb267b852f0392db78e3acbb6f6c9ef124bdb71de'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    let allData = [];

    $('.entries .entry').each((i, el) => {
      const thumbnail = $(el).find('.thumbnail img').attr('src');
      const title = $(el).find('.title span').text().trim();
      const type = $(el).find('.type').text().trim();
      const chapter = $(el).find('.artists a span').text().trim(); 
      const updateTime = $(el).find('.dtch').text().trim();

      allData.push({
        thumbnail,
        title, 
        type,
        chapter,
        updateTime
      });
    });

    console.log(`Scraped page ${page} for type ${type}`);
    return allData;

  } catch (error) {
    console.error('Error scraping doujindesu:', error);
    throw error;
  }
};

const searchDoujin = async (page = 1, query = {}) => {
  try {
    const { title = '', author = '', character = '', status = '', type = '', genre = [] } = query;
    
    // Build search URL with page parameter
    let searchParams = new URLSearchParams();
    if (title) searchParams.append('title', title);
    if (author) searchParams.append('author', author);
    if (character) searchParams.append('character', character);
    if (status) searchParams.append('statusx', status);
    if (type) searchParams.append('typex', type);
    searchParams.append('order', 'update');
    
    // Add genres
    genre.forEach(g => {
      searchParams.append('genre[]', g.trim());
    });

    // Build base URL with page number
    const pageNum = page || 1;
    const url = `https://doujindesu.tv/manga/page/${pageNum}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    console.log('Search URL:', url);

    const response = await axios.post('https://api.brightdata.com/request', {
      zone: 'doujin',
      url: url,
      format: 'raw'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 2de006f706f0280a42bd3effb267b852f0392db78e3acbb6f6c9ef124bdb71de'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    let allData = [];

    $('.entries .entry').each((i, el) => {
      const thumbnail = $(el).find('.thumbnail img').attr('src');
      const title = $(el).find('.title span').text().trim();
      const type = $(el).find('.type').text().trim();
      const rating = $(el).find('.score').text().trim(); 
      const status = $(el).find('.status').text().trim();

      allData.push({
        thumbnail,
        title, 
        type,
        rating,
        status
      });
    });

    console.log(`Scraped search results for page ${pageNum}`);
    return allData;

  } catch (error) {
    console.error('Error searching doujindesu:', error);
    throw error;
  }
};

export { getTypeDoujindesu, searchDoujin };
