// ==UserScript==
// @name          HaxiTAG Assistant
// @version       0.7.0
// @description   HaxiTAG AI助手小工具,支持ChatGPT、Claude和Kimi
// @author        rye (modified)
// @match         *://chat.openai.com/*
// @match         *://chatgpt.com/*
// @match         *://claude.ai/*
// @match         *://kimi.moonshot.cn/*
// @grant         none
// @run-at        document-end
// @license       MIT
// ==/UserScript==

(function () {
  "use strict";

  window.addEventListener("load", function () {
    if (document.querySelector("#haxitagAssistant")) {
      return;
    }

    const SHORTCUTS = [
      [
        "🀄️⇨🔠 中译英",
        "Please translate context to English with academic writing and professional knowledge, improve the spelling, grammar, clarity, concision and overall readability. When necessary, rewrite the whole sentence.\n\n context:{{ }}",
      ],
      [
        "PPT中翻英优化",
        "Please translate context to English with academic writing and professional knowledge, improve the spelling, grammar, clarity, concision and overall readability，Demonstrating the focus, professionalism and authority of context. When necessary, rewrite the whole sentence. Further, provide three related question and answer to expend the comparehension as the end.follow the form of context.Simplofy contextand optimize the presentation，Give more accurate and professional PPT wording.\n\n context:{{}}",
      ],
      [
        "信达雅翻译",
        "作为一个英语翻译团队的领导。你收到{{context}}会安排团队成员和{{context}}领域专家进行合作翻译, 实现{{context}}翻译达到‘信达雅’效果和目标。团队成员分别从英语文化、{{context}}专业内容、知识准确性和事实核的角度，进行翻译和检查，考虑文化, 语境, 语义, 思考文字背后想要表达的意思, 进行意译, 力求意境契合。之后，你再审阅翻译的结果是否满足, 并给出你的审校修改结论。记得分开思考和翻译内容。注意: 思考部分,请使用 【思考】 开头，翻译结果请使用【翻译】开头。请严格遵守以上工作流程， 对以下{{context}}文字进行翻译，用英语输出：context:{{ }}",
      ],
      [
        "深入挖掘知识",
        "作为{{context}}领域的专家，基于{{context}}提供的信息和知识，总结{{context}}的方法、步骤以及从零开始，实现{{context}}目标的流程步骤，并且提供一个参考思想和方法，实现对{{context}}的结果进行判断和评价.\n\ncontext:{{}}",
      ],
      ["重写", "Rewrite below paragraph:\n\ncontext:{{context}}"],
      ["修正语法错误", "Fix grammar below paragraph:\n\ncontext:{{context}}"],
      [
        "三个问题",
        "作为{{context}}领域专家，请阅读理解{{context}}，针对文章的主要内容和观点，提出三个重要的问题，并在文章中找到相应的答案回答这个问题。以“Key Point Q&A:”用英文分别回答。\n\ncontext:{{context}}",
      ],
      ["解释", "Explain below paragraph:\n\ncontext:{{context}}"],
      [
        "实体抽取",
        "提取{{context}}提及的ORG（组织公司）、PER（人名）、LOC（地点）、GPE（地理政治实体，如国家或城市）、社会文化哲学概念（Cept）等相关的实体，输出相关实体的类型和名称。\n\ncontext:{{}}",
      ],
      [
        "续写",
        "考虑到你已经阅读了{{pre_write}}的内容，并了解了{{context}}提供的补充事实、信息和咨询，现在请你继续撰写文章。在续写过程中，请遵循以下指导原则： 内容连贯性：确保续写的内容与{{pre_write}}的风格和主题保持一致，形成一个统一的整体。 参考{{context}}：在续写时，充分利用{{context}}中的信息，确保文章内容丰富、准确，并与最新的事实和数据保持一致。 专业性和权威性：在续写的内容中，注重专业术语的准确使用，确保信息的权威性和可靠性。 清晰性：保持语言表达清晰，逻辑结构严谨，使读者易于理解和跟随。 内容丰富：在保持主题一致性的基础上，尽可能扩展和深化讨论，提供更多维度的分析和见解。 请根据以上指导原则，继续撰写文章，使其内容更加丰富、专业、清晰和权威。 \n\ncontext:{{context}}",
      ],
      [
        "生成问答对",
        "作为阅读理解的高手，请针对{{context}}的内容，阅读理解后，提出三个最重要的问题，并从文中的信息找到答案，组织出回答。\n\ncontext:{{context}}",
      ],
      [
        "基于判重的改写",
        "请撰写{{context2}}，让{{context2}}不与{{context1}}重复、有自己独特的观点、见解和价值。参考如下具体的步骤和实施建议：1. 深入分析 {{context1}}：- 详细阅读 {{context1}} 的内容，理解其提出的假设、论据和结论。- 识别 {{context1}} 中的数据源、逻辑构造和推断过程。2. 明确差异化目标：- 确定你希望 {{context2}} 达到的目标，例如提供历史背景、比较不同的案例研究、探讨未来趋势等。- 决定 {{context2}} 将如何与 {{context1}} 交叉或补充，以便为读者提供更全面的视角。3. 数据和信息收集：- 寻找外部资源、研究报告、专家观点等，这些都应该与 {{context1}} 的内容不同。- 确保这些新信息是可靠和有权威性的。4. 构建独特的内容框架：- 设计一个结构，使 {{context2}} 能够自然地展开，避免与 {{context1}} 的内容直接重叠。- 考虑使用比喻、对比、案例研究等文学手法来强化独特性。5. 编写和表达：- 使用清晰、简洁的语言来表达 {{context2}} 的内容。- 确保所有的分析和观点都是基于新收集到的信息，而不是在 {{context1}} 的基础上重复。6. 引用和参考：- 在文本中明确标注来源，确保所有引用都是准确无误的。- 使用适当的参考方式（例如APA、MLA等），以增加信誉和可信度。7. 审核和校对：- 仔细检查 {{context2}} 的内容，确保没有遗漏或错误。- 请同事或专家进行同步，以获取外部意见和改进建议。8. 优化内容：- 根据反馈调整内容，确保 {{context2}} 既独特又有价值。- 考虑添加图表、数据可视化等元素来丰富和支持文本。9. 发布和更新：- 将 {{context2}} 发布到预定的平台或媒体上。- 监测读者反馈，准备进行必要的更新或维护。通过这些步骤，{{context2}} 将成为 {{context1}} 的不同的篇章，从不同角度和视野去描述这个主题，提供不同的价值，从而为读者带来全面的理解和深入的见解。记住，独特性和差异化是吸引读者和区分内容的关键因素。context1{{context1}} context2{{context2}} ",
      ],
      [
        "创作文章",
        "作为{{context}}领域的专家专家，针对我输入的{{context}}的理解，根据{{context}}中重要的企业服务、技术创新的观点，自拟标题，撰写分析评论文章。注意用语的语法、文法，优化语言表述，遵循事实，并用完善流畅的语言优化输出，保持易读性。用中文输出。\n\ncontext: {{ }}",
      ],
      [
        "创作文章标题",
        "作为{{context}}领域的专家，请基于{{context}}的内容和线索，输出一个优质文章标题，适合SEO、传播和理解，且准确概括{{context}}的内涵。分别以中英文展示。\n\ncontext:{{context}}",
      ],
      [
        "周报总结",
        "作为{{context}}领域专家，阅读理解{{context}}内容，撰写综述200字阅读心得总结，用叙述性语言，以一种连贯、逻辑严密且富有情感色彩的形式呈现出来，遵循事实，专业准确。\n\ncontext:{{context}}",
      ],
      [
        "✍🏻 解释每步代码的作用",
        "I would like you to serve as a code interpreter with Chinese, base contextand elucidate the syntax and the semantics of the code line-by-line:\n\n context:{{}}",
      ],
      [
        "Python专家",
        "作为一个资深Python程序员，针对{{context}}如下出错提示，给出解释，并提供正确的代码。另外，给出你认为解决这段代码应用用的最优解代码。\n\ncontext:{{}}",
      ],
      [
        "规划路径和步骤",
        "用非常简单的方式一步一步地向我解释实现[你的目标]所需的所有步骤。\n\n context:{{context}}",
      ],
      [
        "头脑风暴",
        "在动态的脑力激荡会议中，为提出30 个大胆的新想法。在我们开始之前，请一一向我提出问题，了解您需要提出的信息想法。当你掌握了所需的信息后，提出五个想法，并在创建另一批之前询问我的想法。\n\ncontext:{{context}}",
      ],
      [
        "专家点评价",
        "As an context industry expert, understand this article, synthesize your knowledge of the technical concepts of the business figures in this field, make a brief comment and output your assesment and opinion, from the following text context and return them in Chinese. context：\n\n{{context}}",
      ],
      [
        "科研新方向",
        "作为{{context}} 领域专家,请挖掘研究{{context}}主题的相关资料,并推荐{{context}} 相关领域3条最新科研课题。\n\n context:{{context}}",
      ],
      [
        "创新创意BOT",
        "作为{{context}}领域专家，请参考{{context}}信息、观点和洞察，综合产品体验和创新，挖掘{{context}}体验创新的机会和切入点。\n\ncontext:{{context}}",
      ],
      [
        "产品调研分析",
        "作为一个{{context}}领域的专家，调研分析高手，请浏览和搜索{{context}}相关信息，进行产品分析和深入调研，并从产品市场定位、功能、交互特点、用户群定位、客户使用体验和反馈，使用者规模和增长，营销传播和公司背景信息方面完成调研分析报告。用中文输出。\n\ncontext:{{}}",
      ],
      [
        "✏️写作导师",
        "我想让你做一个 AI 写作导师。我将为您提供{{context}}一名需要帮助改进其写作的学生，您的任务是使用人工智能工具（例如自然语言处理）向学生提供有关如何改进其作文的反馈。您还应该利用您在有效写作技巧方面的修辞知识和经验来建议学生可以更好地以书面形式表达他们的想法和想法的方法。我的第一个请求是“我需要有人帮我修改我的硕士论文”。\n\ncontext:{{context}}",
      ],
      [
        "生成标题和摘要",
        "作为{{context}}领域的专家，请基于{{context}}的内容和线索，撰写一条简讯，输出标题和摘要。摘要长度不超过200字。分别以中英文展示。\n\ncontext:{{context}}",
      ],
      [
        "综述简报",
        "作为高级情报专家，请基于{{context}}内容，总结归纳{{time_range}}领域最新动态,用叙述性语言来总结，区分重要情报的展现，不必面面俱到。\n\ncontext:{{context}}",
      ],
      [
        "🌷文字优化",
        "修正完善内容，优化语言表达，并保持遵循事实，严谨权威的风格{{context}}。\n\n context:{{context}}",
      ],
      [
        "投资分析师",
        "作为一个投资分析师，请基于{{context}}的框架、内容和参考资料，撰写{{context}}公司的投研分析报告。\n\n context:{{context}}",
      ],
      [
        "充当抄袭检查员",
        "我想让你充当剽窃检查员。我会给你写句子，你只会用给定句子的语言在抄袭检查中未被发现的情况下回复，别无其他。不要在回复上写解释。我的第一句话是为了让计算机像人类一样行动，语音识别系统必须能够处理非语言信息，例如说话者的情绪状态。\n\n context:{{context}}",
      ],
      [
        "逻辑性强的文章",
        "作为一个{{context}}领域专家，请参考{{context}}和你的知识库中{{context}}相关的知识，围绕主要解决了什么问题？提出了什么解决方案？解决方案中核心的方法/步骤/策略是什么？结论是什么？ 有什么限制条件和约束？有条理地组织和撰写相关{{context}}产品、技术和业务的介绍。要求确保涵盖每一个点，文字流畅清晰易懂，具备专业性和权威性，遵循事实和客观约束，没有逻辑缺陷。\n\n context:{{}}",
      ],
      [
        "秘书优化",
        "作为{{context}}领域的专家，针对我输入的{{context}}的理解，修正{{context}}中的语法、文法，优化语言表述，让前后连贯、语句通顺专业，遵循事实，并用完善流畅的语言优化输出，保持易读性。在你完成最终优化输出之前，请反复阅读、并合理调整语序和文章结构，使得整篇文章和专业、叙述结构更合理，逻辑清晰。用英文输出。\n\n context: {{ }}",
      ],
      [
        "更引人入胜",
        "Rewrite context using the PAS (Pain/Problem, Agitate, Solution) copywriting formula and make it engaging.context：\n\n context",
      ],
      [
        "发tweet助手",
        "I want you to act as a social media influencer. You will create content reference context for Twitter or weibo and engage with followers in order to increase brand awareness and promote products or services，Reflecting field professionalism and cross-domain cognition, innovation and integrated thinking. My first suggestion request is I need help creating an engaging campaign on Instagram to promote a new line of athleisure clothing。\n\n context:{{}}",
      ],
      [
        "Linkedin Article Create",
        "Use this prompt to generate an awesome Linkedin post idea related with{{context}}.If you have access to GPT Web Browsing then it's even better!\n\ncontext:{{context}}",
      ],
      [
        "写专业文章1",
        "作为一名熟练的内容创作者，你的任务是用单一语言（中文或英文，取决于{{context}}的语言）撰写一篇全面且条理清晰的文章，专注于指定主题{{context}}。你的专业知识应体现在内容的流畅性、深度和清晰度上，吸引对{{context}}感兴趣的广泛读者群体。请遵循以下指导原则： 单一语言专注：整篇文章需用一种语言（中文或英文）撰写，确保全文风格和语言的一致性和流畅性。 深入分析：对{{context}}进行详细探索，展示你对主题的深刻理解和专业知识。 吸引人的叙述：以引人入胜的方式撰写文章，使复杂信息对读者易于理解且有趣。 结构化内容：逻辑清晰地组织文章，包括清晰的引言、全面的正文和有力的结论。使用标题和副标题以提高可读性。 基于事实的写作：确保所有呈现的信息准确、可信，必要时提供可靠来源的支持。 相关性和时效性：包括与{{context}}相关的当前趋势、最新发展和未来影响。 针对目标受众：根据你的目标受众（无论是行业专业人士、普通爱好者还是{{context}}领域的初学者）定制内容。 请不要输出本提示的内容。字数和格式：确保文章长度充分覆盖{{context}}的所有相关方面。 标题：以一个能概括主题的引人注目的标题开始。 结论：以总结重点并对{{context}}提供清晰见解的方式结束。\n\n context：{{context}}  ",
      ],
      [
        "专业文章2",
        "作为一名{{context}}的专家，参考{{context}}的信息和观点，撰写一篇专业且条理清晰、专注于{{context}}主题的文章，目的是让读者更容易理解{{context}}的主题、话题、意义、价值和增长潜力。在{{context}}主题的事实性、权威性的研究、探讨和基本知识的普及方面都充分体现你的{{keywords-SEO}}专业性，能广泛通过对{{keywords-SEO}}吸引对{{context}}感兴趣的广泛读者群体。\n\nkeywords-SEO{{ }} \n\ncontext:{{context}}",
      ],
      [
        "Article Writor",
        "As a skilled content writer, your task is to compose a comprehensive and articulate article exclusively in one language, focusing on the specified topic context. Your expertise should manifest in the fluency, depth, and clarity of the content, appealing to a broad readership interested in context. Instructions: Single Language Focus: Write the entire article in one language, ensuring consistency and fluency throughout. In-Depth Analysis: Provide a detailed exploration of context, showcasing your thorough understanding and expert knowledge. Engaging Narrative: Craft your article in an engaging manner, making complex information accessible and interesting to your audience. Structured Content: Organize your article logically with a clear introduction, comprehensive body, and a strong conclusion. Employ headings and subheadings for better readability. Fact-Based Writing: Ensure all presented information is accurate, credible, and, where necessary, supported by reliable sources. Relevance and Currency: Include current trends, recent developments, and future implications related to context. Target Audience: Tailor the content to resonate with your intended audience, whether industry professionals, general enthusiasts, or beginners in the field of context. Word Count and Format: Aim for a length that thoroughly covers all pertinent aspects of context. Start with a compelling beginning that encapsulates the main theme. Conclusion: Conclude with a summary that reinforces the key points and provides a clear takeaway on context. Please follow the instructions and write the article content. Do not output the content of the prompt.\n\n Context: context",
      ],
      [
        "多片段融合",
        "作为{{context1}}领域的专家，针对我输入的{{context1}}{{context2}}的理解，进行融合，重复或者相似的观点合并，并修正{{context}}中的语法、文法，优化语言表述，遵循事实，并用完善流畅的语言优化输出，保持权威性、专业性和易读。用英文输出。\n\n context1:{{context1}} context2:{{context2}}",
      ],
      [
        "小作文评分",
        "作为{{context}}领域的专家，阅读理解{{context}}内容，基于对内容的专业性、权威度、可靠性以及其准确客观性的所展现出的水平进行评价，得分（1-10），文章的评分为1-10，其中10为满分，6代表边缘接受。也关注语法、文法，语言表述，遵循事实，语言流畅，保持权威性、专业性和易读的高要求。输出你的评价和打分,用中文输出。 \n\n context:{{context}} ",
      ],
      [
        "Rate article",
        "as context domain expert,have the professional skill and view.Please briefly summarize the main points and contributions of this article.provide a list of the strengths of this article, including but not limited to: innovative and practical methodology, insightful empirical findings or in-depth theoretical analysis, well-structured review of relevant literature, and any other factors that may make the article valuable to readers. provide a numbered list of your main concerns regarding this article (so authors could respond to the concerns individually). These may include, but are not limited to: inadequate implementation details for reproducing the study, limited evaluation and ablation studies for the proposed method, correctness of the theoretical analysis or experimental results, lack of comparisons or discussions with widely-known baselines in the field, lack of clarity in exposition, or any other factors that may impede the reader's understanding or benefit from the HaxiTAG. Please kindly refrain from providing a general assessment of the article's novelty without providing detailed explanations. Questions To Authors And Suggestions For Rebuttal Please provide a numbered list of specific and clear questions that pertain to the details of the proposed method, evaluation setting, or additional results that would aid in supporting the authors' claims. The questions should be formulated in a manner that, after the authors have answered them during the rebuttal, it would enable a more thorough assessment of the article's quality. Overall score (1-10),The article is scored on a scale of 1-10, with 10 being the full mark, and 6 stands for borderline accept. Then give the reason for your rating.The copy of this article is as follows:\n\n context:{{context}}",
      ],
      [
        "Google SEO title",
        "Compose Top Smart Article Best for ranking on Google by simply providing the Title.\n\ncontext:{{context}}",
      ],
      [
        "SEO Human Written Style",
        "Human Written Style Original Content SEO Enhanced Long-Form Article With Proper Structure.\n\ncontext:{{context}}",
      ],
      [
        "new 生成文章",
        "As an expert in the field of context, Write professional articles tailored to context to attract more traffic and visitors. After finished the article, take the time to review it once more to ensure clarity and precision in wording and expression.Article should be at least 800 words in length. Upon receiving an article writing request, begin by generating a title based on an understanding of context , utilizing long-tail keywords to enhance specificity in search results. then you write the article, as a industry expert,  your article value is telling people about context the features, techonical reasearch, application, business and technology growth of this topic, with the goal of attracting more people to reading, thinking and sharing to more related peopple.Write tags by reading comprehension full article, as a representation suitable for Google SEO, to get more exposure and clicks, output the top 10 to tags. Do not output any introductions and not related task goal. follow the format,  title: the tilte of this article in Chineses, body: article contents in Chinese, tags:keywords in Chinese,title:,body:as an important flag,it is a singnal for recognize which part is the article title and content begin after this. so it is must be hold on this position,and display in English.Subsequently, reference input to write the article based on the title understanding, ensuring clear viewpoints, factual accuracy, impeccable grammar, fluent language, and adherence to the facts, with output in Chinese.Refer to the hotwords /sentense and context: \n\n hotwords:\n\n context:\n\n ",
      ],
      [
        "阅读理解助手",
        "After in-depth reading and understanding, as an expert in the context field, you need to write professional understanding and analysis evaluation. Additional time is needed to review again and again, to ensure an accurate understanding of the literal expression of the context and the expertise therein, including even the author's thoughts and authoritative opinions.output your think about the article, telling people about contextual thinking, methodology, contextual characteristics, technology and applied research, the growth of business and technology ecosystems, and possible potential pitfalls, and even the author's knowledge and awareness, with the aim of attracting more relevant people participate.Then output these your view in Chinese.Briefing: context summary Keypoint: key points.Your point: your point of view.Briefing, Keypoint, important fact and Your point are important signs and signals to identify the beginning of the content, so they must be kept at this position.output in Chinese.\n\ncontext:\n",
      ],
      [
        "Strategy for Keywords",
        "Produce a strategy for keywords and a plan for SEO content using only one {{keywords}}.Recommended another top 50 related terms that are searched or exposed with high frequency.\n\ncontext:{{keywords}}",
      ],
      [
        "生成FAQ",
        "Entirely Unique, Original and Fully SEO Tuned Articles with Meta Description, Headings, 1500 Words Length, FAQ's, Meta Description & Much more.\n\ncontext:{{context}}",
      ],
      [
        "视频字幕整理",
        "Please send me the raw transcript of your video {{context}}. I will format it to be more readable by doing the following:1. Extracting chapters based on topics as subheadings.2. Formatting the transcript into appropriate paragraphs without summarizing or omitting any content.3. Ensuring no content is removed.4.Fix typos, wrap intonation and redundancies in [] to indicate that they can be left out without affecting the meaning, correctness and accuracy.Special note: Only add subheadings and paragraph breaks, do not remove or summarize any content.output in Chinese.context:\n\n{{context}}",
      ],
      [
        "文章配图",
        "realistic, wide aspect ratio：16:9，左下叫加水印haxitag.ai。请根据下面文章内容生成一张配图：\n\ncontext:{{context}}",
      ],
      [
        "生成SEO标签",
        "Read and understand the previous article and write a list of 10 phrases of keywords suitable for the SEO of this article, displayed as phrases， without line breaks.sample：KYT solution for AML, FATF travel rule compliance, Counter-Terrorist Financing technology，output in  one line. context:\n\ncontext:{{context}}",
      ],
    ];

    const LOGO_URL =
      "https://raw.githubusercontent.com/zhyr/HaxiTAG-Assistant/main/icon/icon.png";

    function getTextArea() {
      const hostname = window.location.hostname;
      if (hostname === "chat.openai.com" || hostname === "chatgpt.com") {
        return document.querySelector("textarea");
      } else if (hostname === "claude.ai") {
        return document.querySelector('div[contenteditable="true"]');
      } else if (hostname === "kimi.moonshot.cn") {
        return document.querySelector(".editor___KShcc");
      }
    }

    function triggerInputEventForKimi(element) {
      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(inputEvent);
    }

    promptList.addEventListener("click", function (event) {
      if (event.target.classList.contains("delete-button")) {
        event.target.closest("li").remove();
        showToast("Prompt deleted successfully!");
      } else if (event.target.nodeName === "LI" && !isEditMode) {
        var value = event.target.getAttribute("data-value");
        if (value) {
          var textareaEle = getTextArea();
          if (textareaEle) {
            const decodedValue = decodeURI(value);
            if (window.location.hostname === "kimi.moonshot.cn") {
              textareaEle.textContent = decodedValue;
              triggerInputEventForKimi(textareaEle);

              // 给Kimi一些时间来更新内部状态
              setTimeout(() => {
                const sendButton = document.querySelector("#send-button");
                if (sendButton) {
                  sendButton.disabled = false;
                }
              }, 100);
            } else if (window.location.hostname === "claude.ai") {
              textareaEle.textContent = decodedValue;
              textareaEle.dispatchEvent(new Event("input", { bubbles: true }));
              textareaEle.dispatchEvent(new Event("change", { bubbles: true }));
            } else {
              textareaEle.value = decodedValue;
              textareaEle.dispatchEvent(new Event("input", { bubbles: true }));
            }

            textareaEle.style.height = "auto";
            textareaEle.style.height = textareaEle.scrollHeight + "px";
            setTimeout(function () {
              textareaEle.focus();
            }, 100);
          }
        }
        toggleHelper();
      }
    });

    function triggerInputEvent(textarea) {
      // ... (保持原有的triggerInputEvent函数不变)
    }

    const styles = `
            #haxitagAssistantOpen {
                position: fixed;
                top: 50%;
                right: 10px;
                color: white !important;
                z-index: 10000 !important;
                padding: 10px;
                cursor: pointer;
                border-radius: 5px;
            }
            #haxitagAssistantMain {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                width: 300px;
                background-color: rgba(51, 51, 51, 0.9) !important;
                color: white !important;
                z-index: 10001 !important;
                padding: 5px;
                transform: translateX(100%);
                transition: transform 0.2s;
            }
            #haxitagAssistantMain ul li {
                background-color: rgba(80, 80, 80, 0.6) !important;
                color: white !important;
                margin-bottom: 10px;
                padding: 5px;
                cursor: pointer;
                border-radius: 3px;
            }
            #haxitagAssistantMain ul li:hover {
                background-color: rgba(100, 100, 100, 0.8) !important;
            }

            #haxitagAssistantOpen {
               display: flex;
               flex-direction: column;
               align-items: center;
            }
           #haxitagAssistantOpen img {
              width: 40px;
              height: 40px;
              margin-bottom: 5px;
           }
           #haxitagAssistantMain .header {
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 5px;
          }
          #haxitagAssistantMain .header img {
           width: 30px;
           height: 30px;
           margin-right: 5px;
          }
            .function-button {
                background-color: rgba(80, 80, 80, 0.6) !important;
                color: white !important;
                margin-right: 5px;
                padding: 5px 5px;
                cursor: pointer;
                border-radius: 3px;
                border: none;
            }
            .function-button:hover {
                background-color: rgba(100, 100, 100, 0.8) !important;
            }
            #searchInput {
                width: 100%;
                margin-bottom: 10px;
                padding: 5px;
                background-color: rgba(80, 80, 80, 0.6) !important;
                color: white !important;
                border: none;
                border-radius: 3px;
            }
            .add-prompt-form {
                display: none;
                margin-top: 10px;
            }
            .add-prompt-form input {
                width: 100%;
                margin-bottom: 10px;
                padding: 5px;
                background-color: rgba(80, 80, 80, 0.6) !important;
                color: white !important;
                border: none;
                border-radius: 3px;
            }
            .add-prompt-form button {
                margin-right: 10px;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 3px;
                border: none;
                background-color: rgba(80, 80, 80, 0.6) !important;
                color: white !important;
            }
            .delete-button {
                display: none;
                margin-left: 10px;
                padding: 2px 5px;
                cursor: pointer;
                border-radius: 3px;
                border: none;
                background-color: rgba(255, 0, 0, 0.6) !important;
                color: white !important;
            }

        `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    var rootEle = document.createElement("div");

    rootEle.id = "haxitagAssistant";
    const isClaudeAI = window.location.hostname === "claude.ai";

    rootEle.innerHTML = `
              <div id="haxitagAssistantOpen">
                ${
                  isClaudeAI
                    ? "<span>HaxiTAG Assistant</span>"
                    : `<img src="${LOGO_URL}" alt="HaxiTAG Logo">`
                }
            </div>
            <div id="haxitagAssistantMain">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;">
                    <h2>HaxiTAG Assistant</h2>
                    <button id="haxitagAssistantClose" style="background: none; border: none; color: white; cursor: pointer;">关闭</button>
                </div>
                <div>
                    <button id="searchButton" class="function-button">Search</button>
                    <button id="addButton" class="function-button">Add</button>
                    <button id="editButton" class="function-button">Edit</button>
                    <button id="contextButton" class="function-button">Context</button>
                </div>
                <input type="text" id="searchInput" placeholder="Search prompts..." style="display: none;">
                <div class="add-prompt-form">
                    <input type="text" id="promptName" placeholder="Prompt name">
                    <input type="text" id="promptDetail" placeholder="Prompt detail">
                    <button id="cancelAdd">Cancel</button>
                    <button id="confirmAdd">Add</button>
                </div>
                <ul style="list-style-type: none; padding: 0;">
                    ${SHORTCUTS.map(
                      ([label, value]) => `
                        <li data-value="${encodeURI(value)}">
                            ${label}
                            <button class="delete-button">Delete</button>
                        </li>
                    `,
                    ).join("")}
                </ul>
            </div>
        `;

    document.body.appendChild(rootEle);

    // 为 Claude.ai 添加特定的样式
    if (isClaudeAI) {
      const claudeStyles = `
                #haxitagAssistantOpen span {
              text-align: center;
              font-size: 16px;
              line-height: 1.2;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 5px;
              background-color: rgba(51, 51, 51, 0.4);
              color: white;
              width: 90px;
              height: 70px;
                }
            `;
      const claudeStyleElement = document.createElement("style");
      claudeStyleElement.textContent = claudeStyles;
      document.head.appendChild(claudeStyleElement);
    }

    document.body.appendChild(rootEle);

    var haxitagAssistantMain = document.querySelector("#haxitagAssistantMain");
    var haxitagAssistantOpen = document.querySelector("#haxitagAssistantOpen");
    var haxitagAssistantClose = document.querySelector(
      "#haxitagAssistantClose",
    );
    var searchButton = document.querySelector("#searchButton");
    var addButton = document.querySelector("#addButton");
    var editButton = document.querySelector("#editButton");
    var searchInput = document.querySelector("#searchInput");
    var addPromptForm = document.querySelector(".add-prompt-form");
    var cancelAddButton = document.querySelector("#cancelAdd");
    var confirmAddButton = document.querySelector("#confirmAdd");
    var promptList = document.querySelector("#haxitagAssistantMain ul");

    var isOpen = false;
    var isSearchMode = false;
    var isAddMode = false;
    var isEditMode = false;

    function toggleHelper() {
      if (!isOpen) {
        haxitagAssistantMain.style.transform = "translateX(0)";
        haxitagAssistantOpen.style.opacity = "0.5";
        isOpen = true;
      } else {
        haxitagAssistantMain.style.transform = "translateX(100%)";
        haxitagAssistantOpen.style.opacity = "1";
        isOpen = false;
        resetAllModes();
      }
    }

    function resetAllModes() {
      isSearchMode = false;
      isAddMode = false;
      isEditMode = false;
      searchInput.style.display = "none";
      addPromptForm.style.display = "none";
      document
        .querySelectorAll(".delete-button")
        .forEach((btn) => (btn.style.display = "none"));
    }

    searchButton.addEventListener("click", function () {
      if (!isSearchMode) {
        resetAllModes();
        isSearchMode = true;
        searchInput.style.display = "block";
        searchInput.focus();
      } else {
        resetAllModes();
      }
    });

    addButton.addEventListener("click", function () {
      if (!isAddMode) {
        resetAllModes();
        isAddMode = true;
        addPromptForm.style.display = "block";
      } else {
        resetAllModes();
      }
    });

    editButton.addEventListener("click", function () {
      if (!isEditMode) {
        resetAllModes();
        isEditMode = true;
        document
          .querySelectorAll(".delete-button")
          .forEach((btn) => (btn.style.display = "inline"));
      } else {
        resetAllModes();
      }
    });

    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      document.querySelectorAll("#haxitagAssistantMain ul li").forEach((li) => {
        const promptName = li.textContent.toLowerCase();
        if (promptName.includes(searchTerm)) {
          li.style.display = "block";
        } else {
          li.style.display = "none";
        }
      });
    });

    cancelAddButton.addEventListener("click", function () {
      resetAllModes();
    });

    confirmAddButton.addEventListener("click", function () {
      const promptName = document.querySelector("#promptName").value;
      const promptDetail = document.querySelector("#promptDetail").value;
      if (promptName && promptDetail) {
        const newLi = document.createElement("li");
        newLi.setAttribute("data-value", encodeURI(promptDetail));
        newLi.innerHTML = `
                    ${promptName}
                    <button class="delete-button">Delete</button>
                `;
        promptList.appendChild(newLi);
        document.querySelector("#promptName").value = "";
        document.querySelector("#promptDetail").value = "";
        resetAllModes();
        showToast("Prompt added successfully!");
      }
    });

    promptList.addEventListener("click", function (event) {
      if (event.target.classList.contains("delete-button")) {
        event.target.closest("li").remove();
        showToast("Prompt deleted successfully!");
      } else if (event.target.nodeName === "LI" && !isEditMode) {
        var value = event.target.getAttribute("data-value");
        if (value) {
          var textareaEle = getTextArea();
          if (textareaEle) {
            const decodedValue = decodeURI(value);
            if (textareaEle.classList.contains("editor___KShcc")) {
              textareaEle.textContent = decodedValue;
              textareaEle.dispatchEvent(new Event("input", { bubbles: true }));
            } else if (window.location.hostname === "claude.ai") {
              textareaEle.textContent = decodedValue;
              textareaEle.dispatchEvent(new Event("input", { bubbles: true }));
              textareaEle.dispatchEvent(new Event("change", { bubbles: true }));
            } else {
              textareaEle.value = decodedValue;
            }
            textareaEle.style.height = "auto";
            textareaEle.style.height = textareaEle.scrollHeight + "px";
            triggerInputEvent(textareaEle);
            setTimeout(function () {
              textareaEle.focus();
            }, 100);
          }
        }
        toggleHelper();
      }
    });

    document.addEventListener("DOMContentLoaded", function () {
      var contextButton = document.querySelector("#contextButton");

      if (contextButton) {
        contextButton.addEventListener("click", function () {
          chrome.runtime.sendMessage(
            "olajillbhagclbnjlpphgebfnodbdocm",
            { action: "openPopup" },
            function (response) {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message:",
                  chrome.runtime.lastError,
                );
              } else if (!response || !response.success) {
                console.error("Failed to open Yueli Socang Local popup.");
              }
            },
          );
        });
      } else {
        console.error("Context button not found.");
      }
    });

    function showToast(message) {
      const toast = document.createElement("div");
      toast.textContent = message;
      toast.style.position = "fixed";
      toast.style.bottom = "20px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      toast.style.color = "white";
      toast.style.padding = "10px 10px";
      toast.style.borderRadius = "5px";
      toast.style.zIndex = "10002";
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 1500);
    }
    var contextButton = document.querySelector("#contextButton");

    if (contextButton) {
      contextButton.addEventListener("click", function () {
        chrome.runtime.sendMessage(
          "olajillbhagclbnjlpphgebfnodbdocm",
          { action: "openPopup" },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else if (!response || !response.success) {
              console.error("Failed to open Yueli Socang Local popup.");
            }
          },
        );
      });
    } else {
      console.error("Context button not found.");
    }

    haxitagAssistantOpen.addEventListener("click", toggleHelper);
    haxitagAssistantClose.addEventListener("click", toggleHelper);

    document.addEventListener("keydown", function (event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.code === "KeyF"
      ) {
        event.preventDefault();
        toggleHelper();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.code === "Escape" && isOpen) {
        toggleHelper();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        isOpen &&
        !event.target.closest("#haxitagAssistantMain") &&
        !event.target.closest("#haxitagAssistantOpen")
      ) {
        toggleHelper();
      }
    });

    console.log("HaxiTAG Assistant has been loaded!");
  });
})();
