package com.wdh.blog.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wdh.blog.entity.BlogInfo;
import com.wdh.blog.util.PageQueryUtils;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface BlogMapper extends BaseMapper<BlogInfo>{
    int deleteByPrimaryKey(Long blogId);

    int insert(BlogInfo record);

    int insertSelective(BlogInfo record);

    BlogInfo selectByPrimaryKey(Long blogId);

    int updateByPrimaryKeySelective(BlogInfo record);

    int updateByPrimaryKeyWithBLOBs(BlogInfo record);

    int updateByPrimaryKey(BlogInfo record);

    List<BlogInfo> findBlogList(PageQueryUtils pageUtil);

    List<BlogInfo> findBlogListByType(@Param("type") int type, @Param("limit") int limit);

    int getTotalBlogs(PageQueryUtils pageUtil);

    int removeBatch(Integer[] ids);

    List<BlogInfo> getBlogsPageByTagId(PageQueryUtils pageUtil);

    int getTotalBlogsByTagId(PageQueryUtils pageUtil);

    BlogInfo selectBySubUrl(String subUrl);

    int updateBlogCategorys(@Param("categoryName") String categoryName, @Param("categoryId") Integer categoryId, @Param("ids")Integer[] ids);

}