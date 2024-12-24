import axios from 'axios';
import * as cheerio from 'cheerio';

const getAllDoujindesu = async (page = 1, type = 'Doujinshi') => {
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

export { getAllDoujindesu };
