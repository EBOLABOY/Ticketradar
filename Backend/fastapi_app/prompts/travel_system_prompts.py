#!/usr/bin/env python3
"""
旅行规划AI系统提示词管理
专门管理旅行规划相关的AI提示词
"""

import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class TravelSystemPrompts:
    """旅行规划系统提示词管理器"""
    
    def __init__(self):
        self.prompts_dir = os.path.dirname(__file__)
        self.base_dir = os.path.join(self.prompts_dir, "..", "..")
        self._cached_prompts = {}
    
    def get_travel_planning_prompt(self, language: str = "zh") -> str:
        """获取旅行规划系统提示词"""
        cache_key = f"travel_planning_{language}"
        
        if cache_key in self._cached_prompts:
            return self._cached_prompts[cache_key]
        
        try:
            # 尝试从文件加载
            prompt_file = os.path.join(self.base_dir, f"ai_travel_system_prompt_{language}.txt")
            
            if not os.path.exists(prompt_file):
                # 如果没有语言特定文件，使用默认文件
                prompt_file = os.path.join(self.base_dir, "ai_travel_system_prompt.txt")
            
            if os.path.exists(prompt_file):
                with open(prompt_file, 'r', encoding='utf-8') as f:
                    prompt = f.read().strip()
                    self._cached_prompts[cache_key] = prompt
                    logger.info(f"✅ 成功加载旅行规划提示词: {os.path.basename(prompt_file)}")
                    return prompt
            else:
                # 使用内置默认提示词
                prompt = self._get_default_travel_prompt(language)
                self._cached_prompts[cache_key] = prompt
                logger.warning(f"使用内置默认旅行规划提示词 ({language})")
                return prompt
                
        except Exception as e:
            logger.error(f"加载旅行规划提示词失败: {e}")
            prompt = self._get_default_travel_prompt(language)
            self._cached_prompts[cache_key] = prompt
            return prompt
    
    def get_user_preference_prompt(self, user_preferences: str = "", language: str = "zh") -> str:
        """获取用户偏好相关的提示词补充"""
        if not user_preferences.strip():
            return ""
        
        if language == "zh":
            return f"""

## 用户个性化偏好
用户特别提到的偏好和要求：
{user_preferences}

请在制定旅行规划时特别考虑这些偏好，并在相关建议中体现用户的个性化需求。
"""
        else:
            return f"""

## User Personal Preferences
User's specific preferences and requirements:
{user_preferences}

Please consider these preferences when creating the travel plan and reflect the user's personalized needs in relevant recommendations.
"""
    
    def get_markdown_format_instruction(self, language: str = "zh") -> str:
        """获取Markdown格式输出指令"""
        if language == "zh":
            return """

## 输出格式要求

请使用标准的Markdown格式输出旅行规划，包括：

### 格式规范
- 使用 # ## ### 等标题层级
- 使用 **粗体** 和 *斜体* 强调重点
- 使用 - 或 1. 创建列表
- 使用 > 创建引用块
- 使用 `代码` 标记重要信息
- 使用表格展示结构化数据
- 使用 emoji 增加可读性

### 内容结构
1. **旅行概览** - 目的地介绍和亮点
2. **详细行程** - 按天分解的具体安排
3. **实用信息** - 交通、住宿、餐饮建议
4. **贴心提醒** - 注意事项和小贴士

确保输出的内容格式美观、层次清晰、易于阅读。
"""
        else:
            return """

## Output Format Requirements

Please use standard Markdown format for the travel plan output, including:

### Format Specifications
- Use # ## ### for heading levels
- Use **bold** and *italic* for emphasis
- Use - or 1. for lists
- Use > for blockquotes
- Use `code` for important information
- Use tables for structured data
- Use emoji for readability

### Content Structure
1. **Travel Overview** - Destination introduction and highlights
2. **Detailed Itinerary** - Day-by-day arrangements
3. **Practical Information** - Transportation, accommodation, dining suggestions
4. **Helpful Tips** - Precautions and tips

Ensure the output is well-formatted, clearly structured, and easy to read.
"""
    
    def _get_default_travel_prompt(self, language: str = "zh") -> str:
        """获取默认的旅行规划提示词"""
        if language == "zh":
            return """你是一个专业的AI旅行规划助手，专门为用户制定详细、实用、个性化的旅行计划。

## 核心职责
1. 根据用户需求制定个性化旅行规划
2. 提供实用可行的建议和安排
3. 考虑文化敏感性和安全因素
4. 整合真实用户体验数据

## 规划原则
- 时间安排合理，避免过于紧凑
- 预算控制在用户范围内
- 交通规划高效便捷
- 住宿建议考虑位置和性价比
- 餐饮推荐平衡特色和偏好
- 景点活动符合用户兴趣

## 输出要求
请使用Markdown格式输出，包含旅行概览、详细行程、实用信息和贴心提醒。
确保信息准确、逻辑清晰、个性化程度高、实用性强。"""
        else:
            return """You are a professional AI travel planning assistant, specializing in creating detailed, practical, and personalized travel plans for users.

## Core Responsibilities
1. Create personalized travel plans based on user needs
2. Provide practical and feasible suggestions and arrangements
3. Consider cultural sensitivity and safety factors
4. Integrate real user experience data

## Planning Principles
- Reasonable time arrangements, avoiding over-scheduling
- Budget control within user's range
- Efficient and convenient transportation planning
- Accommodation suggestions considering location and value
- Dining recommendations balancing specialties and preferences
- Attractions and activities matching user interests

## Output Requirements
Please use Markdown format for output, including travel overview, detailed itinerary, practical information, and helpful tips.
Ensure information is accurate, logically clear, highly personalized, and practical."""

    def reload_prompts(self):
        """重新加载所有提示词（清除缓存）"""
        self._cached_prompts.clear()
        logger.info("🔄 旅行规划提示词缓存已清除")

# 创建全局实例
travel_prompts = TravelSystemPrompts()

def get_travel_system_prompt(language: str = "zh", user_preferences: str = "") -> str:
    """获取完整的旅行规划系统提示词"""
    base_prompt = travel_prompts.get_travel_planning_prompt(language)
    preference_prompt = travel_prompts.get_user_preference_prompt(user_preferences, language)
    format_prompt = travel_prompts.get_markdown_format_instruction(language)
    
    return f"{base_prompt}{preference_prompt}{format_prompt}"

def reload_travel_prompts():
    """重新加载旅行规划提示词"""
    travel_prompts.reload_prompts()
