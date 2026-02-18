import i18n from "i18next";
import qs from "qs";
import { initReactI18next } from "react-i18next";
const zh = {
  "author": "作者",
  "date": "日期",
  "main_title": "LF-WeMakit",
  "unavailable": "已停用",
  "dl_win_x64": "下载 Windows x64 应用",
  "open_in_browser": "浏览器中打开",
  "game_in_browser": "浏览器中游玩",
  "play_in_browser": "浏览器中播放",
  "goto_github": "打开Github项目地址",
  "goto_gimink": "打开作者博客",
  "switch_lang": "切换语言 / Switch Language",
  "no_content": "无内容",
  "visit_author_link": "访问作者链接",
  "download": "下载",
  "cover_img": "封面图",
  "data_zip": "数据包",
  "description": "描述",
  "changelog": "更新日志",
  "edit_description_here": "在此编辑描述(请尽量使用Markdown语法)",
  "edit_changelog_here": "在此编辑更新日志(请尽量使用Markdown语法)",
  "data_zip_title": "标题",
  "edit_title_here": "在此编辑标题",
  "author_url": "作者链接",
  "edit_author_here": "在此编辑作者署名",
  "edit_author_url_here": "在此编辑作者链接（你的博客或个人资料）",
  "edit_mod_info": "编辑MOD信息",
  "base_info": "基本信息",
  "WIP": "🚧",
  "unpublished": "未发布",
  "login": "登录",
  "github_login": "Github授权登录",
  "gitee_login": "Gitee授权登录",
  "logout": "登出",
  "your_works": "你的作品",
  "mod_base_info": "基础信息",
  "mod_brief": "简介",
  "mod_description": "描述",
  "mod_changelog": "更新日志",
  "edit_brief_here": "再此编辑简介(500字内)",
  "workspace": "工作间",
  "attachment": "附件",
  "latest_build_time": "最近构建"
}
const en = {
  "author": "author",
  "date": "date",
  "main_title": "LF-WeMakit",
  "unavailable": "Unavailable",
  "dl_win_x64": "Download Window x64 Application",
  "open_in_browser": "Open in Browser",
  "play_in_browser": "Play in Browser",
  "game_in_browser": "Game in Browser",
  "goto_github": "Visit this Project on Github",
  "goto_gimink": "Visit Author Blog",
  "switch_lang": "切换语言 / Switch Language",
  "no_content": "No Content",
  "visit_author_link": "Visit Author Link",
  "download": "Download",
  "cover_img": "Cover",
  "data_zip": "Data Zip",
  "description": "Description",
  "changelog": "Changelog",
  "edit_description_here": "Edit Description Here (Pls use Markdown)",
  "edit_changelog_here": "Edit Changelog Here (Pls use Markdown)",
  "data_zip_title": "Title",
  "edit_title_here": "Edit Title Here",
  "edit_author_here": "Edit Author Here",
  "author_url": "Author URL",
  "edit_author_url_here": "Edit Author URL Here (Your blog or profile)",
  "edit_mod_info": "Edit Mod Info",
  "base_info": "Base Info",
  "WIP": "🚧",
  "unpublished": "Unpublished",
  "login": "Log in",
  "github_login": "Login with GitHub",
  "gitee_login": "Login with Gitee",
  "logout": "Logout",
  "your_works": "Your Works",
  "mod_base_info": "Base Infomation",
  "mod_brief": "Brief",
  "mod_description": "Description",
  "mod_changelog": "Changelog",
  "edit_brief_here": "Edit Brief Here (Within 500 Characters)",
  "workspace": "Workspace",
  "attachment": "Attachment",
  "latest_build_time": "Latest Build"
}
const resources = {
  "zh": { translation: zh },
  "zh-Hans": { translation: zh },
  "zh-CN": { translation: zh },
  "zh-SG": { translation: zh },
  "zh-MY": { translation: zh },
  "zh-Hant": { translation: zh },
  "zh-TW": { translation: zh },
  "zh-HK": { translation: zh },
  "zh-MO": { translation: zh },
  en: { translation: en }
};
const hobj = qs.parse(location.hash.substring(1))
const sobj = qs.parse(location.search.substring(1))
const hsobj = location.hash.indexOf('?') >= 1 ? qs.parse(location.hash.substring(location.hash.indexOf('?') + 1)) : {}
const lang = sobj.lang || hobj.lang || hsobj.lang;
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: typeof lang === 'string' ? lang : navigator.language,
    interpolation: { escapeValue: false }
  });

export default i18n;