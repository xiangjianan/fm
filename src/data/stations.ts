import type { Station } from "../types";

/**
 * 电台数据（2026-09-02 逐流验证：播放列表 + 分片可达 + CORS）
 * freq: 0 = 无公开 FM 频率（UI 显示 NET，刻度按 99.0 落位）
 * 来源：satellitepull.cnr.cn（央广卫星 CDN）/ sk.cri.cn（国际台）/
 *       brtv-radiolive.rbc.cn（北京）/ stream.hndt.com（河南）/ iqilu（山东）
 */
export const STATIONS: Station[] = [
  // —— 中央人民广播电台 / 国际台 ——
  { id: "zgzs", name: "中国之声", freq: 106.1, region: "中央", url: "https://satellitepull.cnr.cn/live/wxzgzs/playlist.m3u8", backup: "https://ngcdn001.cnr.cn/live/zgzs/index.m3u8" },
  { id: "jjzs", name: "经济之声", freq: 96.6, region: "中央", url: "https://satellitepull.cnr.cn/live/wxjjzs/playlist.m3u8", backup: "https://ngcdn002.cnr.cn/live/jjzs/index.m3u8" },
  { id: "yyzs", name: "音乐之声", freq: 90.0, region: "中央", url: "https://satellitepull.cnr.cn/live/wxyyzs/playlist.m3u8" },
  { id: "wyzs", name: "文艺之声", freq: 106.6, region: "中央", url: "https://satellitepull.cnr.cn/live/wxwyzs/playlist.m3u8" },
  { id: "jdyy", name: "经典音乐广播", freq: 101.8, region: "中央", url: "https://satellitepull.cnr.cn/live/wxdszs/playlist.m3u8" },
  { id: "xczs", name: "乡村之声", freq: 99.0, region: "中央", url: "https://satellitepull.cnr.cn/live/wxxczs/playlist.m3u8" },
  { id: "lnzs", name: "老年之声", freq: 0, region: "中央", url: "https://satellitepull.cnr.cn/live/wxlnzs/playlist.m3u8" },
  { id: "mzzs", name: "民族之声", freq: 0, region: "中央", url: "https://satellitepull.cnr.cn/live/wxmzzs/playlist.m3u8" },
  { id: "hqzx", name: "环球资讯", freq: 90.5, region: "中央", url: "https://sk.cri.cn/905.m3u8", backup: "https://satellitepull.cnr.cn/live/wxhqzx01/playlist.m3u8" },
  { id: "hyhq", name: "华语环球", freq: 0, region: "中央", url: "https://sk.cri.cn/hyhq.m3u8" },
  { id: "sjhs", name: "世界华声", freq: 0, region: "中央", url: "https://sk.cri.cn/hxfh.m3u8" },
  { id: "nhzs", name: "南海之声", freq: 0, region: "中央", url: "https://sk.cri.cn/nhzs.m3u8", backup: "https://satellitepull.cnr.cn/live/wxnhzs/playlist.m3u8" },
  { id: "hitfm", name: "HIT FM", freq: 88.7, region: "中央", url: "https://satellitepull.cnr.cn/live/wxhitfm/playlist.m3u8" },
  { id: "cgtn", name: "China Plus", freq: 0, region: "中央", url: "https://sk.cri.cn/am846.m3u8" },
  // —— 北京 ——
  { id: "bjxw", name: "北京新闻广播", freq: 94.5, region: "北京", url: "https://brtv-radiolive.rbc.cn/alive/fm945.m3u8" },
  { id: "bjjt", name: "北京交通广播", freq: 103.9, region: "北京", url: "https://brtv-radiolive.rbc.cn/alive/fm1039.m3u8" },
  { id: "bjyy", name: "北京音乐广播", freq: 97.4, region: "北京", url: "https://brtv-radiolive.rbc.cn/alive/fm974.m3u8" },
  { id: "bjwy", name: "北京文艺广播", freq: 87.6, region: "北京", url: "https://brtv-radiolive.rbc.cn/alive/fm876.m3u8" },
  { id: "jjj", name: "京津冀之声", freq: 100.6, region: "北京", url: "https://brtv-radiolive.rbc.cn/alive/fm1006.m3u8" },
  { id: "bjcs", name: "北京城市广播", freq: 0, region: "北京", url: "https://satellitepull.cnr.cn/live/wxbjcsfwgl/playlist.m3u8" },
  // —— 天津 ——（天津本地台暂无公开可播流，以覆盖京津冀的联播频率代替）
  { id: "jjjtj", name: "京津冀之声", freq: 100.6, region: "天津", url: "https://brtv-radiolive.rbc.cn/alive/fm1006.m3u8" },
  // —— 河北 ——
  { id: "hbzh", name: "河北综合广播", freq: 104.3, region: "河北", url: "https://satellitepull.cnr.cn/live/wxhebzhgb/playlist.m3u8" },
  { id: "hbjt", name: "河北交通广播", freq: 99.2, region: "河北", url: "https://satellitepull.cnr.cn/live/wxhebjtgb/playlist.m3u8" },
  { id: "hbyy", name: "河北音乐广播", freq: 0, region: "河北", url: "https://satellitepull.cnr.cn/live/wxhebyygb/playlist.m3u8" },
  { id: "hbsh", name: "河北生活广播", freq: 0, region: "河北", url: "https://satellitepull.cnr.cn/live/wxhebshgb/playlist.m3u8" },
  // —— 山西 ——
  { id: "sxzh", name: "山西综合广播", freq: 0, region: "山西", url: "https://satellitepull.cnr.cn/live/wxssxxwgb/playlist.m3u8" },
  // —— 内蒙古 ——
  { id: "nmghy", name: "内蒙古汉语广播", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmghyzhxwgb/playlist.m3u8" },
  { id: "nmgjt", name: "内蒙古交通之声", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmgjtgb/playlist.m3u8" },
  { id: "nmgyy", name: "内蒙古音乐之声", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmgyygb/playlist.m3u8" },
  { id: "nmgmy", name: "蒙古语广播", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmgmygb/playlist.m3u8" },
  { id: "nmgdw", name: "内蒙古对外广播", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmgdwgb/playlist.m3u8" },
  { id: "nmgly", name: "绿野之声", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmglyzs/playlist.m3u8" },
  { id: "nmgmyzh", name: "蒙古语综合广播", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmgmyxwgb/playlist.m3u8" },
  { id: "hlbehy", name: "呼伦贝尔汉语广播", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmghlbehygb/playlist.m3u8" },
  { id: "hlbemy", name: "呼伦贝尔蒙语广播", freq: 0, region: "内蒙古", url: "https://satellitepull.cnr.cn/live/wx32nmghlbemygb/playlist.m3u8" },
  // —— 辽宁 ——
  { id: "lnzh", name: "辽宁之声", freq: 0, region: "辽宁", url: "https://satellitepull.cnr.cn/live/wxlnzhgb/playlist.m3u8" },
  { id: "lnjt", name: "辽宁交通广播", freq: 97.5, region: "辽宁", url: "https://satellitepull.cnr.cn/live/wxlnjtgb/playlist.m3u8" },
  { id: "lnjj", name: "辽宁经济广播", freq: 0, region: "辽宁", url: "https://satellitepull.cnr.cn/live/wxlnjjtb/playlist.m3u8" },
  { id: "lnwy", name: "辽宁文艺广播", freq: 0, region: "辽宁", url: "https://satellitepull.cnr.cn/live/wxlnwygb/playlist.m3u8" },
  { id: "lnxc", name: "辽宁乡村广播", freq: 0, region: "辽宁", url: "https://satellitepull.cnr.cn/live/wxlnxcgb/playlist.m3u8" },
  // —— 吉林 ——
  { id: "jlxw", name: "吉林新闻综合广播", freq: 0, region: "吉林", url: "https://satellitepull.cnr.cn/live/wxjlxwzhgb/playlist.m3u8" },
  { id: "jljt", name: "吉林交通广播", freq: 0, region: "吉林", url: "https://satellitepull.cnr.cn/live/wxjljtgb/playlist.m3u8" },
  { id: "jljj", name: "吉林经济广播", freq: 0, region: "吉林", url: "https://satellitepull.cnr.cn/live/wxjljjgb/playlist.m3u8" },
  { id: "jlxc", name: "吉林乡村广播", freq: 0, region: "吉林", url: "https://satellitepull.cnr.cn/live/wxjlxcgb/playlist.m3u8" },
  // —— 黑龙江 ——
  { id: "hljxw", name: "黑龙江新闻广播", freq: 94.6, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljxwgb/playlist.m3u8" },
  { id: "hljjt", name: "黑龙江交通广播", freq: 99.8, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljjtgb/playlist.m3u8" },
  { id: "hljsjc", name: "黑龙江私家车广播", freq: 0, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljsjcgb/playlist.m3u8" },
  { id: "hljxc", name: "黑龙江乡村广播", freq: 0, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljxcgb/playlist.m3u8" },
  { id: "hljgx", name: "黑龙江高校广播", freq: 0, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljgxgb/playlist.m3u8" },
  { id: "hljnx", name: "黑龙江女性广播", freq: 0, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljnxgb/playlist.m3u8" },
  { id: "hljaj", name: "黑龙江爱家调频", freq: 0, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljajgb/playlist.m3u8" },
  { id: "hljcy", name: "黑龙江朝鲜语广播", freq: 0, region: "黑龙江", url: "https://satellitepull.cnr.cn/live/wx32hljcygb/playlist.m3u8" },
  // —— 上海 ——
  { id: "shxw", name: "上海新闻广播", freq: 93.4, region: "上海", url: "https://satellitepull.cnr.cn/live/wx32shrmgb/playlist.m3u8" },
  { id: "dycj", name: "第一财经广播", freq: 97.7, region: "上海", url: "https://satellitepull.cnr.cn/live/wx32dycjgb/playlist.m3u8" },
  // —— 江苏 ——
  { id: "jsxw", name: "江苏新闻综合广播", freq: 93.7, region: "江苏", url: "https://satellitepull.cnr.cn/live/wx32jsxwzhgb/playlist.m3u8" },
  { id: "jsjt", name: "江苏交通广播", freq: 101.1, region: "江苏", url: "https://satellitepull.cnr.cn/live/wx32jsjtgb/playlist.m3u8" },
  { id: "jsyy", name: "江苏音乐广播", freq: 89.7, region: "江苏", url: "https://satellitepull.cnr.cn/live/wx32jsyygb/playlist.m3u8" },
  { id: "jscj", name: "江苏财经广播", freq: 0, region: "江苏", url: "https://satellitepull.cnr.cn/live/wx32jscjgb/playlist.m3u8" },
  { id: "jsxw2", name: "江苏新闻广播", freq: 0, region: "江苏", url: "https://satellitepull.cnr.cn/live/wx32jsxwgb/playlist.m3u8" },
  { id: "jsgs", name: "江苏故事广播", freq: 0, region: "江苏", url: "https://satellitepull.cnr.cn/live/wx32jsgsgb/playlist.m3u8" },
  // —— 浙江 ——
  { id: "zjjt", name: "浙江交通之声", freq: 93.0, region: "浙江", url: "https://satellitepull.cnr.cn/live/wxzjjtgb/playlist.m3u8" },
  { id: "zjcs", name: "浙江城市之声", freq: 0, region: "浙江", url: "https://satellitepull.cnr.cn/live/wxzjcszs/playlist.m3u8" },
  { id: "zjjj", name: "浙江经济广播", freq: 0, region: "浙江", url: "https://satellitepull.cnr.cn/live/wxzjjjgb/playlist.m3u8" },
  { id: "zjnvz", name: "浙江女主播电台", freq: 104.5, region: "浙江", url: "https://satellitepull.cnr.cn/live/wxzj1045/playlist.m3u8" },
  { id: "zjms", name: "浙江民生广播", freq: 99.6, region: "浙江", url: "https://satellitepull.cnr.cn/live/wxzjmsgb/playlist.m3u8" },
  // —— 安徽 ——
  { id: "ahzs", name: "安徽之声", freq: 0, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahxxgb/playlist.m3u8" },
  { id: "ahjt", name: "安徽交通广播", freq: 90.8, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahjtgb/playlist.m3u8" },
  { id: "ahjj", name: "安徽经济广播", freq: 0, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahjjgb/playlist.m3u8" },
  { id: "ahsh", name: "安徽生活广播", freq: 0, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahshgb/playlist.m3u8" },
  { id: "ahly", name: "安徽旅游广播", freq: 0, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahlygb/playlist.m3u8" },
  { id: "ahnc", name: "安徽农村广播", freq: 0, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahncgb/playlist.m3u8" },
  { id: "ahxq", name: "安徽戏曲广播", freq: 0, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahxqgb/playlist.m3u8" },
  { id: "ahxsps", name: "安徽小说评书广播", freq: 0, region: "安徽", url: "https://satellitepull.cnr.cn/live/wxahxspsgb/playlist.m3u8" },
  // —— 福建 ——
  { id: "fjxw", name: "福建新闻广播", freq: 0, region: "福建", url: "https://satellitepull.cnr.cn/live/wx32fjxwgb/playlist.m3u8" },
  { id: "fjjt", name: "福建交通广播", freq: 100.7, region: "福建", url: "https://satellitepull.cnr.cn/live/wx32fjdnjtgb/playlist.m3u8" },
  { id: "fjds", name: "福建都市广播", freq: 98.7, region: "福建", url: "https://satellitepull.cnr.cn/live/wx32fjdndsgb/playlist.m3u8" },
  { id: "fjdn", name: "福建东南广播", freq: 0, region: "福建", url: "https://satellitepull.cnr.cn/live/wx32fjdngb/playlist.m3u8" },
  { id: "fjcj", name: "福建财经广播", freq: 96.1, region: "福建", url: "https://satellitepull.cnr.cn/live/wx32fjdnjjgb/playlist.m3u8" },
  // —— 江西 ——
  { id: "jxxw", name: "江西新闻广播", freq: 0, region: "江西", url: "https://satellitepull.cnr.cn/live/wx32jiangxxwgb/playlist.m3u8" },
  { id: "jxyy", name: "江西音乐广播", freq: 0, region: "江西", url: "https://satellitepull.cnr.cn/live/wx32jiangxyygb/playlist.m3u8" },
  // —— 山东 ——
  { id: "sdjt", name: "山东交通广播", freq: 101.1, region: "山东", url: "https://satellitepull.cnr.cn/live/wxsdjtgb/playlist.m3u8" },
  { id: "sdyy", name: "山东音乐广播", freq: 99.1, region: "山东", url: "https://satellitepull.cnr.cn/live/wxsdyygb/playlist.m3u8" },
  { id: "sdwy", name: "山东文艺广播", freq: 97.5, region: "山东", url: "https://satellitepull.cnr.cn/live/wxsdwyssgb/playlist.m3u8" },
  { id: "sdjd", name: "山东经典音乐广播", freq: 0, region: "山东", url: "https://audiolive302.iqilu.com/sdradioShenghuo/sdradio04/playlist.m3u8" },
  { id: "sdxc", name: "山东乡村广播", freq: 0, region: "山东", url: "https://satellitepull.cnr.cn/live/wxsdxcgb/playlist.m3u8" },
  // —— 河南 ——
  { id: "hnxw", name: "河南新闻广播", freq: 0, region: "河南", url: "https://satellitepull.cnr.cn/live/wxhnxwgb/playlist.m3u8", backup: "https://stream.hndt.com/live/xinwen/playlist.m3u8" },
  { id: "hnjt", name: "河南交通广播", freq: 104.7, region: "河南", url: "https://stream.hndt.com/live/jiaotong/playlist.m3u8" },
  { id: "hnyy", name: "河南音乐广播", freq: 88.1, region: "河南", url: "https://stream.hndt.com/live/yinyue/playlist.m3u8" },
  { id: "hnjj", name: "河南经济广播", freq: 0, region: "河南", url: "https://satellitepull.cnr.cn/live/wxhnjjgb/playlist.m3u8" },
  { id: "hnly", name: "河南旅游广播", freq: 0, region: "河南", url: "https://satellitepull.cnr.cn/live/wxhnlygb/playlist.m3u8" },
  { id: "hnnc", name: "河南农村广播", freq: 0, region: "河南", url: "https://satellitepull.cnr.cn/live/wxhnncgb/playlist.m3u8" },
  { id: "hnxq", name: "河南戏曲广播", freq: 0, region: "河南", url: "https://satellitepull.cnr.cn/live/wxhnxqgb/playlist.m3u8" },
  { id: "hnxx", name: "河南信息广播", freq: 0, region: "河南", url: "https://satellitepull.cnr.cn/live/wxhnxxgb/playlist.m3u8" },
  { id: "hnjy", name: "河南教育广播", freq: 0, region: "河南", url: "https://stream.hndt.com/live/jiaoyu/playlist.m3u8" },
  { id: "hnys", name: "河南影视广播", freq: 0, region: "河南", url: "https://stream.hndt.com/live/yingshi/playlist.m3u8" },
  // —— 湖北 ——
  { id: "ctjt", name: "楚天交通广播", freq: 92.7, region: "湖北", url: "https://satellitepull.cnr.cn/live/wx32hubctjtgb/playlist.m3u8" },
  { id: "hbjj2", name: "湖北经济广播", freq: 99.8, region: "湖北", url: "https://satellitepull.cnr.cn/live/wx32hubjjgb/playlist.m3u8" },
  { id: "hbjdyy", name: "湖北经典音乐广播", freq: 103.8, region: "湖北", url: "https://satellitepull.cnr.cn/live/wx32hubyygb/playlist.m3u8" },
  // —— 湖南 ——
  { id: "hnxw2", name: "湖南新闻广播", freq: 102.8, region: "湖南", url: "https://satellitepull.cnr.cn/live/wx32hunxwgb/playlist.m3u8" },
  { id: "hnjt2", name: "湖南交通广播", freq: 91.8, region: "湖南", url: "https://satellitepull.cnr.cn/live/wx32hunjtgb/playlist.m3u8" },
  { id: "hnjj2", name: "湖南经济广播", freq: 90.1, region: "湖南", url: "https://satellitepull.cnr.cn/live/wx32hunjjgb/playlist.m3u8" },
  { id: "xxzs", name: "潇湘之声", freq: 0, region: "湖南", url: "https://satellitepull.cnr.cn/live/wx32hunyygb/playlist.m3u8" },
  { id: "jyzs", name: "金鹰之声", freq: 0, region: "湖南", url: "https://satellitepull.cnr.cn/live/wx32955/playlist.m3u8" },
  // —— 广东 ——
  { id: "gdxw", name: "广东新闻广播", freq: 91.4, region: "广东", url: "https://satellitepull.cnr.cn/live/wxgdxwgb/playlist.m3u8" },
  { id: "ycjt", name: "羊城交通广播", freq: 105.2, region: "广东", url: "https://satellitepull.cnr.cn/live/wxgdycjtt/playlist.m3u8" },
  { id: "zjjj2", name: "珠江经济台", freq: 97.4, region: "广东", url: "https://satellitepull.cnr.cn/live/wxgdzjjjt/playlist.m3u8" },
  { id: "gdcs", name: "广东城市之声", freq: 103.6, region: "广东", url: "https://satellitepull.cnr.cn/live/wxgdcszs/playlist.m3u8" },
  { id: "szfy", name: "深圳飞扬971", freq: 97.1, region: "广东", url: "https://satellitepull.cnr.cn/live/wxszfy971/playlist.m3u8" },
  { id: "gdgs", name: "广东股市广播", freq: 0, region: "广东", url: "https://satellitepull.cnr.cn/live/wxgdgsgb/playlist.m3u8" },
  { id: "gdnf", name: "南方生活广播", freq: 0, region: "广东", url: "https://satellitepull.cnr.cn/live/wxgdnfshgb/playlist.m3u8" },
  { id: "gdwt", name: "广东文体广播", freq: 0, region: "广东", url: "https://satellitepull.cnr.cn/live/wxgdwtgb/playlist.m3u8" },
  { id: "szjt", name: "深圳交通频率", freq: 0, region: "广东", url: "https://satellitepull.cnr.cn/live/wxszjjpl/playlist.m3u8" },
  // —— 广西 ——
  { id: "gxrm", name: "广西人民广播", freq: 0, region: "广西", url: "https://satellitepull.cnr.cn/live/wx32gxrmgb/playlist.m3u8" },
  { id: "gxjt", name: "广西交通广播", freq: 100.3, region: "广西", url: "https://satellitepull.cnr.cn/live/wx32gxjtgb/playlist.m3u8" },
  { id: "gxwy", name: "广西文艺广播", freq: 95.0, region: "广西", url: "https://satellitepull.cnr.cn/live/wx32gxwygb/playlist.m3u8" },
  { id: "gxjy", name: "广西教育生活广播", freq: 93.0, region: "广西", url: "https://satellitepull.cnr.cn/live/wx32gbjyshgb/playlist.m3u8" },
  // —— 海南 ——
  { id: "hainxw", name: "海南新闻广播", freq: 0, region: "海南", url: "https://satellitepull.cnr.cn/live/wxhainxwgb/playlist.m3u8" },
  { id: "hainjt", name: "海南交通广播", freq: 0, region: "海南", url: "https://satellitepull.cnr.cn/live/wxhainjtgb/playlist.m3u8" },
  { id: "hainyy", name: "海南音乐广播", freq: 94.5, region: "海南", url: "https://satellitepull.cnr.cn/live/wxhainyygb/playlist.m3u8" },
  // —— 重庆 ——
  { id: "cqxw", name: "重庆新闻广播", freq: 96.8, region: "重庆", url: "https://satellitepull.cnr.cn/live/wxcqxwgb/playlist.m3u8" },
  { id: "cqjj", name: "重庆经济广播", freq: 101.5, region: "重庆", url: "https://satellitepull.cnr.cn/live/wxcqjjgb/playlist.m3u8" },
  { id: "cqwy", name: "重庆文艺广播", freq: 103.5, region: "重庆", url: "https://satellitepull.cnr.cn/live/wxcqwygb/playlist.m3u8" },
  { id: "cqds", name: "重庆都市广播", freq: 0, region: "重庆", url: "https://satellitepull.cnr.cn/live/wxcqdsgb/playlist.m3u8" },
  // —— 四川 ——
  { id: "sczh", name: "四川综合广播", freq: 98.1, region: "四川", url: "https://satellitepull.cnr.cn/live/wxsczhgb/playlist.m3u8" },
  { id: "scjt", name: "四川交通广播", freq: 101.7, region: "四川", url: "https://satellitepull.cnr.cn/live/wxscjtgb/playlist.m3u8" },
  { id: "scmz", name: "四川民族频率", freq: 0, region: "四川", url: "https://satellitepull.cnr.cn/live/wxscmzgb/playlist.m3u8" },
  // —— 贵州 ——
  { id: "gzzh", name: "贵州综合广播", freq: 0, region: "贵州", url: "https://satellitepull.cnr.cn/live/wx32gzwxwzhgb/playlist.m3u8" },
  { id: "gzjt", name: "贵州音乐广播", freq: 95.2, region: "贵州", url: "https://satellitepull.cnr.cn/live/wx32gzyygb/playlist.m3u8" },
  { id: "gzjj", name: "贵州经济广播", freq: 98.9, region: "贵州", url: "https://satellitepull.cnr.cn/live/wx32gzjjgb/playlist.m3u8" },
  { id: "gzly", name: "贵州旅游广播", freq: 0, region: "贵州", url: "https://satellitepull.cnr.cn/live/wx32gzlygb/playlist.m3u8" },
  { id: "gzgs", name: "贵州故事广播", freq: 0, region: "贵州", url: "https://satellitepull.cnr.cn/live/wx32gzgsgb/playlist.m3u8" },
  // —— 云南 ——
  { id: "ynxw", name: "云南新闻广播", freq: 91.8, region: "云南", url: "https://satellitepull.cnr.cn/live/wxynxwgb/playlist.m3u8" },
  { id: "ynjt", name: "云南交通之声", freq: 91.8, region: "云南", url: "https://satellitepull.cnr.cn/live/wxynjtgb/playlist.m3u8" },
  { id: "ynjj", name: "云南经济广播", freq: 0, region: "云南", url: "https://satellitepull.cnr.cn/live/wxynjjgb/playlist.m3u8" },
  { id: "yngj", name: "云南国际广播", freq: 0, region: "云南", url: "https://satellitepull.cnr.cn/live/wxynsegb/playlist.m3u8" },
  // —— 西藏 ——
  { id: "xzhy", name: "西藏汉语广播", freq: 0, region: "西藏", url: "https://satellitepull.cnr.cn/live/wxxzhygb/playlist.m3u8" },
  { id: "xzzy", name: "西藏藏语广播", freq: 0, region: "西藏", url: "https://satellitepull.cnr.cn/live/wxxzzygb/playlist.m3u8" },
  { id: "xzds", name: "西藏都市生活广播", freq: 0, region: "西藏", url: "https://satellitepull.cnr.cn/live/wxxzdsshgb/playlist.m3u8" },
  { id: "xzzykb", name: "西藏藏语康巴方言", freq: 0, region: "西藏", url: "https://satellitepull.cnr.cn/live/wxxzzykbfy/playlist.m3u8" },
  { id: "xzdwjt", name: "西藏对外交通广播", freq: 0, region: "西藏", url: "https://satellitepull.cnr.cn/live/wxxzdwjtgb/playlist.m3u8" },
  // —— 陕西 ——
  { id: "sxxx", name: "陕西新闻广播", freq: 0, region: "陕西", url: "https://satellitepull.cnr.cn/live/wxsxxxwgb/playlist.m3u8" },
  { id: "sxxyy", name: "陕西音乐广播", freq: 98.8, region: "陕西", url: "https://satellitepull.cnr.cn/live/wxsxxyygb/playlist.m3u8" },
  { id: "sxxqc", name: "陕西青春广播", freq: 105.5, region: "陕西", url: "https://satellitepull.cnr.cn/live/wxsxxqcgb/playlist.m3u8" },
  { id: "sxjj", name: "陕西经济广播", freq: 0, region: "陕西", url: "https://satellitepull.cnr.cn/live/wxsxxjjgb/playlist.m3u8" },
  { id: "sxjt", name: "陕西交通广播", freq: 0, region: "陕西", url: "https://satellitepull.cnr.cn/live/wxsxxjtgb/playlist.m3u8" },
  // —— 甘肃 ——
  { id: "gsxw", name: "甘肃新闻综合广播", freq: 0, region: "甘肃", url: "https://satellitepull.cnr.cn/live/wxgsxwzhgb/playlist.m3u8" },
  { id: "gsjt", name: "甘肃交通广播", freq: 104.8, region: "甘肃", url: "https://satellitepull.cnr.cn/live/wxgsjtgb/playlist.m3u8" },
  { id: "gshh", name: "甘肃黄河之声", freq: 0, region: "甘肃", url: "https://satellitepull.cnr.cn/live/wxgshhzs/playlist.m3u8" },
  { id: "gsds", name: "甘肃都市调频", freq: 0, region: "甘肃", url: "https://satellitepull.cnr.cn/live/wxgsdstb/playlist.m3u8" },
  { id: "gsqc", name: "甘肃青春调频", freq: 0, region: "甘肃", url: "https://satellitepull.cnr.cn/live/wxgsqcgb/playlist.m3u8" },
  // —— 青海 ——
  { id: "qhjj", name: "青海经济广播", freq: 0, region: "青海", url: "https://satellitepull.cnr.cn/live/wx32qhjjgb/playlist.m3u8" },
  { id: "qhjt", name: "青海交通音乐广播", freq: 97.2, region: "青海", url: "https://satellitepull.cnr.cn/live/wx32qhjtyygb/playlist.m3u8" },
  { id: "qhzy", name: "青海藏语广播", freq: 0, region: "青海", url: "https://satellitepull.cnr.cn/live/wx32qhzygb/playlist.m3u8" },
  // —— 宁夏 ——
  { id: "nxxw", name: "宁夏新闻广播", freq: 0, region: "宁夏", url: "https://satellitepull.cnr.cn/live/wxnxxwgb/playlist.m3u8" },
  { id: "nxyy", name: "宁夏音乐广播", freq: 0, region: "宁夏", url: "https://satellitepull.cnr.cn/live/wxnxyygb/playlist.m3u8" },
  // —— 新疆 ——
  { id: "xjxw", name: "新疆新闻广播", freq: 96.1, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjxwgb/playlist.m3u8" },
  { id: "xjsjc", name: "新疆私家车广播", freq: 0, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjsjcgb/playlist.m3u8" },
  { id: "xjwy", name: "维语综合广播", freq: 0, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjwyzhgb/playlist.m3u8" },
  { id: "xjhy", name: "哈语广播", freq: 0, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjhygb/playlist.m3u8" },
  { id: "xjky", name: "柯尔克孜语广播", freq: 0, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjkygb/playlist.m3u8" },
  { id: "xjmy", name: "新疆蒙语广播", freq: 0, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjmygb/playlist.m3u8" },
  { id: "xjls", name: "新疆绿色广播", freq: 0, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjlsgb/playlist.m3u8" },
  { id: "xjwyjt", name: "维语交通文艺广播", freq: 0, region: "新疆", url: "https://satellitepull.cnr.cn/live/wxxjwyjtwygb/playlist.m3u8" },
];

/** 地区顺序：中央在最前，其余按拼音升序（侧栏顺序） */
export const REGIONS: string[] = [
  "中央", "安徽", "北京", "重庆", "福建", "甘肃", "广东", "广西", "贵州", "海南",
  "河北", "河南", "黑龙江", "湖北", "湖南", "吉林", "江苏", "江西", "辽宁", "内蒙古",
  "宁夏", "青海", "山东", "山西", "陕西", "上海", "四川", "天津", "西藏", "新疆",
  "云南", "浙江",
];
