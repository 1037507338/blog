package com.wdh.blog.service;

import com.wdh.blog.entity.AdminUser;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 * 后台管理员信息表 服务类
 * </p>
 *
 * @author: 南街
 * @since 2019-08-25
 */
public interface AdminUserService extends IService<AdminUser> {
    
    boolean validatePassword(Integer userId,String oldPwd);

    boolean updateUserInfo(AdminUser adminUser);

}
